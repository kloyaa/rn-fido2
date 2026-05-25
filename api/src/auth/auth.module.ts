import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../database/entities/User.entity';
import { Authenticator } from '../database/entities/Authenticator.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { Session } from '../database/entities/Session.entity';
import { UserRepository } from '../database/repositories/user.repository';
import { AuthenticatorRepository } from '../database/repositories/authenticator.repository';
import { SessionRepository } from '../database/repositories/session.repository';
import { AuditService } from '../audit/audit.service';
import { RedisService } from '../cache/redis.service';
import { ConfigurationService } from '../config/configuration.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { RegistrationService } from './services/registration.service';
import { LoginService } from './services/login.service';
import { LogoutService } from './services/logout.service';
import { Fido2Service } from './services/fido2.service';
import { PasswordChangeService } from './services/password-change.service';
import { AuthenticatorRevocationService } from './services/authenticator-revocation.service';
import { JwtGuard } from './guards/jwt.guard';
import { RateLimitingMiddleware } from './middleware/rate-limiting.middleware';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Authenticator, AuditLog, Session]),
    JwtModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (config: ConfigurationService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    AuthenticatorRepository,
    SessionRepository,
    AuditService,
    RedisService,
    TokenService,
    PasswordService,
    RegistrationService,
    LoginService,
    LogoutService,
    Fido2Service,
    PasswordChangeService,
    AuthenticatorRevocationService,
    JwtGuard,
    RateLimitingMiddleware,
  ],
  exports: [TokenService, JwtGuard, RedisService],
})
export class AuthModule {}
