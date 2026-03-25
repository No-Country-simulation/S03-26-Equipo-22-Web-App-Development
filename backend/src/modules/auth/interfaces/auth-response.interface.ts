import { UserRole } from '../../users/entities/user.entity';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
    categories: Array<{ id: string; name: string; slug: string }>;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
    isActive: boolean;
    categories: Array<{ id: string; name: string; slug: string }>;
  };
}
