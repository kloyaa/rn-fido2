import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { Authenticated, CurrentUser } from '../decorators/authenticated.decorator';
import { RegistrationService } from '../services/registration.service';
import { LoginService } from '../services/login.service';
import { LogoutService } from '../services/logout.service';
import { Fido2Service } from '../services/fido2.service';
import { PasswordChangeService } from '../services/password-change.service';
import { AuthenticatorRevocationService } from '../services/authenticator-revocation.service';
import { TokenService } from '../services/token.service';
import { RegistrationRequestDto } from '../dto/registration.dto';
import { LoginRequestDto } from '../dto/login.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token.dto';
import { EnrollmentStartRequestDto, EnrollmentVerifyRequestDto } from '../dto/fido2-enrollment.dto';
import { AuthenticationStartRequestDto } from '../dto/fido2-auth.dto';
import { AuthenticationVerifyRequestDto } from '../dto/fido2-auth-verify.dto';
import { PasswordChangeRequestDto } from '../dto/password-change.dto';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';

interface AuthUser {
  userId: string;
  email: string;
  sessionId: string;
}

function getIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '0.0.0.0';
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
    private readonly fido2Service: Fido2Service,
    private readonly passwordChangeService: PasswordChangeService,
    private readonly authenticatorRevocationService: AuthenticatorRevocationService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegistrationRequestDto, @Req() req: object) {
    return this.registrationService.register(dto, getIp(req as Request));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto, @Req() req: object) {
    const r = req as Request;
    const deviceId = r.headers['x-device-id'] as string | undefined;
    return this.loginService.login(dto, getIp(r), deviceId);
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenRequestDto) {
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    const { accessToken } = this.tokenService.generateTokenPair(payload.sub, payload.email, payload.sessionId);
    return { accessToken, expiresIn: 900 };
  }

  @Post('logout')
  @Authenticated()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthUser, @Req() req: object) {
    await this.logoutService.logout(user.userId, user.sessionId, getIp(req as Request));
  }

  @Post('fido2/enroll/start')
  @Authenticated()
  async enrollStart(@CurrentUser() user: AuthUser, @Body() dto: EnrollmentStartRequestDto) {
    return this.fido2Service.startEnrollment(user.userId, dto.deviceName);
  }

  @Post('fido2/enroll/verify')
  @Authenticated()
  async enrollVerify(@CurrentUser() user: AuthUser, @Body() dto: EnrollmentVerifyRequestDto, @Req() req: object) {
    return this.fido2Service.verifyEnrollment(
      user.userId,
      dto.challengeId,
      dto.credential as unknown as RegistrationResponseJSON,
      dto.deviceName,
      getIp(req as Request),
    );
  }

  @Post('fido2/authenticate/start')
  @HttpCode(HttpStatus.OK)
  async authenticateStart(@Body() dto: AuthenticationStartRequestDto, @Req() req: object) {
    return this.fido2Service.startAuthentication(dto, getIp(req as Request));
  }

  @Post('fido2/authenticate/verify')
  @HttpCode(HttpStatus.OK)
  async authenticateVerify(@Body() dto: AuthenticationVerifyRequestDto, @Req() req: object) {
    const r = req as Request;
    const deviceId = r.headers['x-device-id'] as string | undefined;
    return this.fido2Service.verifyAuthentication(
      dto.challengeId,
      dto.credential as unknown as AuthenticationResponseJSON,
      getIp(r),
      deviceId,
    );
  }

  @Post('password/change')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: PasswordChangeRequestDto, @Req() req: object) {
    await this.passwordChangeService.changePassword(user.userId, dto, getIp(req as Request));
    return { message: 'Password changed successfully. Please log in again.' };
  }

  @Get('authenticators')
  @Authenticated()
  async listAuthenticators(@CurrentUser() user: AuthUser) {
    const authenticators = await this.authenticatorRevocationService.listAuthenticators(user.userId);
    return { authenticators };
  }

  @Delete('authenticators/:authenticatorId')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  async revokeAuthenticator(
    @CurrentUser() user: AuthUser,
    @Param('authenticatorId') authenticatorId: string,
    @Req() req: object,
  ) {
    await this.authenticatorRevocationService.revokeAuthenticator(user.userId, authenticatorId, getIp(req as Request));
    return { message: 'Authenticator revoked successfully.' };
  }
}
