import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '../../config/configuration.service';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string;  // userId
  email: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigurationService,
  ) {}

  generateTokenPair(userId: string, email: string, sessionId: string): TokenPair {
    const payload: JwtPayload = { sub: userId, email, sessionId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId, email, sessionId, type: 'refresh', jti: uuidv4() },
      { expiresIn: this.config.jwtRefreshExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.config.jwtExpiresIn,
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  verifyRefreshToken(token: string): { sub: string; email: string; sessionId: string } {
    return this.jwtService.verify<{ sub: string; email: string; sessionId: string }>(token);
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode<JwtPayload>(token);
  }
}
