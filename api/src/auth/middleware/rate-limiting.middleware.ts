import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../cache/redis.service';
import { ConfigurationService } from '../../config/configuration.service';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigurationService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const ip = this.extractIp(req);
    const ipKey = `ip:${ip}`;

    const ipAttempts = await this.redisService.getLoginAttempts(ipKey);
    if (ipAttempts >= this.config.rateLimitMaxAttempts) {
      // Progressive delay: each attempt beyond limit doubles the delay (max 30s)
      const excessAttempts = ipAttempts - this.config.rateLimitMaxAttempts + 1;
      const delayMs = Math.min(1000 * Math.pow(2, excessAttempts - 1), 30000);
      await this.sleep(delayMs);
    }

    next();
  }

  extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress ?? 'unknown';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
