import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

type AuthUser = { id: string; role?: string } | undefined;
type AuthRequest = Request & { user?: AuthUser };

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
export const CurrentUser = GetUser;
