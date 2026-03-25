import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Ip,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { InviteEditorDto } from './dto/invite-editor.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GetUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Autenticación')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Login de usuario (ADMIN o EDITOR)',
    description:
      'Permite iniciar sesión a usuarios con roles ADMIN o EDITOR. Los VISITORS no pueden hacer login.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Login exitoso. Devuelve access token (15 min) y refresh token (7 días).',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o usuario inactivo',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('setup-account/:token')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'Completar registro de editor con token de invitación',
    description:
      'Permite a un editor invitado completar su registro usando el token recibido por email',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de invitación único',
    example: 'abc123-unique-token',
  })
  @ApiResponse({
    status: 201,
    description:
      'Cuenta creada exitosamente. Devuelve tokens JWT para login automático.',
    schema: {
      example: {
        message: 'Cuenta creada exitosamente',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'editor@email.com',
          name: 'Juan Pérez',
          role: 'EDITOR',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado o contraseñas no coinciden',
  })
  async setupAccount(
    @Param('token') token: string,
    @Body() setupAccountDto: SetupAccountDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.authService.setupAccount(
      token,
      setupAccountDto,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({
    summary: 'Renovar access token usando refresh token',
    description:
      'Renueva los tokens y devuelve los datos actualizados del usuario para rehidratar el estado del frontend',
  })
  @ApiResponse({
    status: 200,
    description:
      'Tokens renovados exitosamente. Devuelve nuevos tokens y datos del usuario. El refresh token anterior es revocado.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'editor@email.com',
          fullName: 'Juan Pérez',
          role: 'EDITOR',
          isEmailVerified: true,
          isActive: true,
          categories: [
            { id: 'uuid-1', name: 'JavaScript', slug: 'javascript' },
            { id: 'uuid-2', name: 'React', slug: 'react' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o revocado',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.authService.refresh(
      refreshTokenDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (revoca refresh tokens)' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(
    @GetUser() user: User,
    @Body() refreshTokenDto?: RefreshTokenDto,
  ) {
    await this.authService.logout(user.id, refreshTokenDto);
    return { message: 'Logout exitoso' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      categories: user.categories?.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })) || [],
      createdAt: user.createdAt,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Solicitar reseteo de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Si el email existe, se enviará un email con instrucciones',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({
    status: 200,
    description:
      'Contraseña restablecida exitosamente. Todos los refresh tokens son revocados.',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Post('admin/invite-editor')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Invitar un nuevo editor (solo ADMIN)',
    description:
      'Permite a los administradores invitar editores. Se crea un usuario EDITOR sin contraseña, se le asignan categorías y se envía un email con token de invitación válido por 72 horas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitación enviada exitosamente',
    schema: {
      example: {
        message: 'Invitación enviada exitosamente',
        invitationToken: 'abc123def456...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Requiere rol de ADMIN' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({
    status: 400,
    description: 'Error al enviar el email de invitación o una o más categorías no existen',
  })
  async inviteEditor(@Body() inviteEditorDto: InviteEditorDto) {
    return await this.authService.inviteEditor(inviteEditorDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verificar email con token' })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }
}
