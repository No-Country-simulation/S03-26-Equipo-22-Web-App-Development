import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  sub: string; // user id
  tokenId: string; // refresh token id
}
