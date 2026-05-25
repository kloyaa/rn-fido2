import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../services/token.service';
import { RedisService } from '../../cache/redis.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Access token required' });
    }

    try {
      const payload = this.tokenService.verifyAccessToken(token);

      // Verify session is still active in Redis
      const session = await this.redisService.getSession(payload.sessionId);
      if (!session) {
        throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Session expired or revoked' });
      }

      // Attach user to request
      (request as any).user = { userId: payload.sub, email: payload.email, sessionId: payload.sessionId };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Access token invalid or expired' });
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}
