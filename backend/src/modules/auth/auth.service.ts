import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { InviteEditorDto } from './dto/invite-editor.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Category } from '../categories/entities/category.entity';
import { EmailService } from '../email/email.service';
import {
  JwtPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import {
  AuthResponse,
  RefreshResponse,
} from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens JWT
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        categories: user.categories?.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })) || [],
      },
    };
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshResponse> {
    if (!refreshTokenDto.refreshToken) {
      throw new UnauthorizedException('Refresh token es requerido');
    }

    try {
      // Verificar y decodificar el refresh token
      const payload = this.jwtService.verify<JwtRefreshPayload>(
        refreshTokenDto.refreshToken,
        {
          secret:
            this.configService.get<string>('jwt.refreshSecret') ||
            this.configService.get<string>('jwt.secret'),
        },
      );

      // Buscar el refresh token en la base de datos
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { id: payload.tokenId },
        relations: ['user'],
      });

      if (!refreshToken || refreshToken.isRevoked) {
        throw new UnauthorizedException('Refresh token inválido o revocado');
      }

      if (new Date() > refreshToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      if (!refreshToken.user || !refreshToken.user.isActive) {
        throw new UnauthorizedException('Usuario no autorizado o inactivo');
      }

      // Revocar el refresh token antiguo
      await this.refreshTokenRepository.update(refreshToken.id, {
        isRevoked: true,
      });

      // Obtener usuario con sus categorías actualizadas
      const user = await this.userRepository.findOne({
        where: { id: refreshToken.user.id },
        relations: ['categories'],
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevos tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user, ipAddress, userAgent);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          categories:
            user.categories?.map((cat) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
            })) || [],
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(
    userId: string,
    refreshTokenDto?: RefreshTokenDto,
  ): Promise<void> {
    if (refreshTokenDto?.refreshToken) {
      try {
        // Decodificar el refresh token para obtener el ID
        const payload = this.jwtService.decode(
          refreshTokenDto.refreshToken,
        ) as JwtRefreshPayload;

        if (payload?.tokenId) {
          // Revocar el refresh token específico
          await this.refreshTokenRepository.update(
            { id: payload.tokenId, userId },
            { isRevoked: true },
          );
        }
      } catch (error) {
        // Si hay error al decodificar, continuar para revocar todos los tokens del usuario
      }
    }

    // Revocar todos los refresh tokens del usuario
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // No revelar si el email existe o no por seguridad
    if (!user) {
      return {
        message:
          'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      };
    }

    // Generar token de reseteo de contraseña
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1); // 1 hora

    // Guardar token en la base de datos
    await this.userRepository.update(user.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    // Enviar email de reseteo de contraseña
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        passwordResetToken,
        user.fullName,
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException(
        'Error al enviar el email de reseteo de contraseña',
      );
    }

    return {
      message:
        'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token de reseteo inválido o expirado');
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña y limpiar tokens
    await this.userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Revocar todos los refresh tokens del usuario por seguridad
    await this.refreshTokenRepository.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    );

    return { message: 'Contraseña restablecida exitosamente' };
  }

  async inviteEditor(
    inviteEditorDto: InviteEditorDto,
  ): Promise<{ message: string; invitationToken: string }> {
    const { email, fullName, categoryIds } = inviteEditorDto;

    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Validar que todas las categorías existan
    const categories = await this.categoryRepository.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Una o más categorías no existen');
    }

    // Generar token de invitación
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 72); // 72 horas (3 días)

    // Crear usuario EDITOR sin contraseña (pendiente de activación)
    const user = this.userRepository.create({
      email,
      fullName,
      role: UserRole.EDITOR,
      passwordHash: '', // Vacío hasta que complete el setup
      isActive: false,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      categories, // Asignar las categorías validadas
    });

    await this.userRepository.save(user);

    // Enviar email de invitación con las categorías
    try {
      await this.emailService.sendEditorInvitationEmail(
        email,
        emailVerificationToken,
        fullName,
        categories.map((c) => c.name),
      );
    } catch (error) {
      // Si falla el envío de email, eliminar el usuario creado
      await this.userRepository.delete(user.id);
      throw new BadRequestException(
        'Error al enviar el email de invitación. Por favor, intente nuevamente.',
      );
    }

    return {
      message: 'Invitación enviada exitosamente',
      invitationToken: emailVerificationToken, // Solo para desarrollo/testing
    };
  }

  async setupAccount(
    token: string,
    setupAccountDto: SetupAccountDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      categories: Array<{ id: string; name: string; slug: string }>;
    };
  }> {
    const { name, password, confirmPassword } = setupAccountDto;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Buscar usuario con ese token de invitación y verificar que no esté expirado
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
      },
      relations: ['categories'],
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Verificar que no haya completado ya el registro
    if (user.passwordHash) {
      throw new BadRequestException('Esta cuenta ya fue activada');
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar usuario
    user.fullName = name;
    user.passwordHash = hashedPassword;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.isEmailVerified = true;
    user.isActive = true;

    await this.userRepository.save(user);

    // Generar tokens JWT para login automático
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Cuenta creada exitosamente',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        categories: user.categories?.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })) || [],
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    return await this.usersService.findOne(userId);
  }

  private async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Payload para access token
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generar access token (12 horas)
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '12h',
    });

    // Crear refresh token en la base de datos
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: crypto.randomBytes(64).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      ipAddress,
      userAgent,
    });

    const savedRefreshToken =
      await this.refreshTokenRepository.save(refreshTokenEntity);

    // Payload para refresh token
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      tokenId: savedRefreshToken.id,
    };

    // Generar refresh token JWT (7 días)
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        this.configService.get<string>('jwt.secret'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: verifyEmailDto.token,
        emailVerificationExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Token de verificación inválido o expirado',
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Marcar email como verificado
    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    return { message: 'Email verificado exitosamente' };
  }
}
