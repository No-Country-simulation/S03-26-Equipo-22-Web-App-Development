import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.refreshSecret') ||
        configService.get<string>('jwt.secret') ||
        'default-refresh-secret',
    });
  }

  async validate(payload: JwtRefreshPayload) {
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

    return refreshToken.user;
  }
}
