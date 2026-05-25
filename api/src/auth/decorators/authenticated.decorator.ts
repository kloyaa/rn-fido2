import { createParamDecorator, ExecutionContext, UseGuards, applyDecorators } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).user as AuthenticatedUser;
  },
);

export function Authenticated() {
  return applyDecorators(UseGuards(JwtGuard));
}
