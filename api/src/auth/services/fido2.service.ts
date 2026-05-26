import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatorRepository } from '../../database/repositories/authenticator.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { RedisService } from '../../cache/redis.service';
import { AuditService } from '../../audit/audit.service';
import { ConfigurationService } from '../../config/configuration.service';
import { EnrollmentStartResponseDto, EnrollmentVerifyResponseDto } from '../dto/fido2-enrollment.dto';
import { AuthenticationStartResponseDto, AuthenticationStartRequestDto } from '../dto/fido2-auth.dto';
import { AuthenticationVerifyResponseDto } from '../dto/fido2-auth-verify.dto';
import { TokenService } from './token.service';
import { SessionRepository } from '../../database/repositories/session.repository';

interface ChallengeData {
  challenge: string;
  userId: string;
  deviceName?: string;
  [key: string]: unknown;
}

function isChallengeData(v: Record<string, unknown>): v is ChallengeData {
  return typeof v.challenge === 'string' && typeof v.userId === 'string';
}

// Android passkeys embed apk-key-hash as origin instead of the HTTPS URL
function toAndroidOrigins(sha256Fingerprints: string[]): string[] {
  return sha256Fingerprints.map((fp) => {
    const hash = Buffer.from(fp.replace(/:/g, ''), 'hex').toString('base64url');
    return `android:apk-key-hash:${hash}`;
  });
}

@Injectable()
export class Fido2Service {
  constructor(
    private readonly authenticatorRepository: AuthenticatorRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigurationService,
    private readonly tokenService: TokenService,
  ) {}

  async startEnrollment(userId: string, deviceName?: string): Promise<EnrollmentStartResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const existingAuthenticators = await this.authenticatorRepository.findActiveByUserId(userId);

    const options = await generateRegistrationOptions({
      rpName: this.configService.fido2RpName,
      rpID: this.configService.fido2RpId,
      userName: user.email,
      userDisplayName: user.username ?? user.email,
      excludeCredentials: existingAuthenticators.map((a) => ({
        id: a.credentialId.toString('base64url'),
        type: 'public-key' as const,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    const challengeId = uuidv4();
    const data: ChallengeData = { challenge: options.challenge, userId, deviceName };
    await this.redisService.storeFido2Challenge(challengeId, data as unknown as Record<string, unknown>);

    return { challengeId, options: options as unknown as Record<string, unknown> };
  }

  async verifyEnrollment(
    userId: string,
    challengeId: string,
    credential: RegistrationResponseJSON,
    deviceName: string | undefined,
    ipAddress: string,
  ): Promise<EnrollmentVerifyResponseDto> {
    const raw = await this.redisService.getFido2Challenge(challengeId);
    if (!raw || !isChallengeData(raw)) {
      await this.auditService.logFailedAttestation(userId, ipAddress, 'challenge expired or not found');
      throw new BadRequestException('CHALLENGE_EXPIRED');
    }

    if (raw.userId !== userId) {
      await this.auditService.logFailedAttestation(userId, ipAddress, 'challenge userId mismatch');
      throw new BadRequestException('INVALID_CHALLENGE');
    }

    let verification;
    try {
      const androidOrigins = toAndroidOrigins(this.configService.androidSha256Fingerprints);
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: raw.challenge,
        expectedOrigin: [this.configService.fido2Origin, ...androidOrigins],
        expectedRPID: this.configService.fido2RpId,
        requireUserVerification: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'attestation verification failed';
      await this.auditService.logFailedAttestation(userId, ipAddress, message);
      throw new BadRequestException('INVALID_ATTESTATION');
    }

    if (!verification.verified || !verification.registrationInfo) {
      await this.auditService.logFailedAttestation(userId, ipAddress, 'verification returned false');
      throw new BadRequestException('INVALID_ATTESTATION');
    }

    await this.redisService.deleteFido2Challenge(challengeId);

    const { credential: cred } = verification.registrationInfo;
    const authenticator = await this.authenticatorRepository.create({
      userId,
      credentialId: Buffer.from(cred.id, 'base64url'),
      publicKey: Buffer.from(cred.publicKey),
      signCounter: cred.counter,
      deviceName: (deviceName ?? raw.deviceName ?? null) as string,
      attestationData: {
        fmt: verification.registrationInfo.fmt,
        aaguid: verification.registrationInfo.aaguid,
      },
    });

    await this.auditService.logBiometricEnrollment(userId, ipAddress, true, { deviceName: authenticator.deviceName });

    return {
      authenticatorId: authenticator.id,
      deviceName: authenticator.deviceName,
      enrolledAt: authenticator.enrolledAt.toISOString(),
    };
  }

  async startAuthentication(dto: AuthenticationStartRequestDto, _ipAddress: string): Promise<AuthenticationStartResponseDto> {
    const user = dto.username.includes('@')
      ? await this.userRepository.findByEmail(dto.username)
      : await this.userRepository.findByUsername(dto.username);

    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const authenticators = await this.authenticatorRepository.findActiveByUserId(user.id);
    if (authenticators.length === 0) throw new BadRequestException('NO_AUTHENTICATORS_ENROLLED');

    const options = await generateAuthenticationOptions({
      rpID: this.configService.fido2RpId,
      allowCredentials: authenticators.map((a) => ({
        id: a.credentialId.toString('base64url'),
        type: 'public-key' as const,
      })),
      userVerification: 'required',
    });

    const challengeId = uuidv4();
    const data: ChallengeData = { challenge: options.challenge, userId: user.id };
    await this.redisService.storeFido2Challenge(challengeId, data as unknown as Record<string, unknown>);

    return { challengeId, options: options as unknown as Record<string, unknown> };
  }

  async verifyAuthentication(
    challengeId: string,
    credential: AuthenticationResponseJSON,
    ipAddress: string,
    deviceIdentifier?: string,
  ): Promise<AuthenticationVerifyResponseDto> {
    const raw = await this.redisService.getFido2Challenge(challengeId);
    if (!raw || !isChallengeData(raw)) {
      await this.auditService.logReplayAttempt(null, ipAddress, 'challenge expired or not found');
      throw new BadRequestException('CHALLENGE_EXPIRED');
    }

    const credentialId = Buffer.from(credential.id, 'base64url');
    const authenticator = await this.authenticatorRepository.findByCredentialId(credentialId);
    if (!authenticator || authenticator.userId !== raw.userId || authenticator.status !== 'active') {
      await this.auditService.logBiometricAuth(raw.userId, ipAddress, false, 'authenticator not found or revoked');
      throw new UnauthorizedException('INVALID_AUTHENTICATOR');
    }

    let verification;
    try {
      const androidOrigins = toAndroidOrigins(this.configService.androidSha256Fingerprints);
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: raw.challenge,
        expectedOrigin: [this.configService.fido2Origin, ...androidOrigins],
        expectedRPID: this.configService.fido2RpId,
        credential: {
          id: credential.id,
          publicKey: new Uint8Array(authenticator.publicKey),
          counter: Number(authenticator.signCounter),
        },
        requireUserVerification: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'assertion verification failed';
      await this.auditService.logBiometricAuth(raw.userId, ipAddress, false, message);
      if (message.toLowerCase().includes('counter')) {
        await this.auditService.logReplayAttempt(raw.userId, ipAddress, message);
        throw new UnauthorizedException('CLONE_DETECTED');
      }
      throw new UnauthorizedException('INVALID_ASSERTION');
    }

    if (!verification.verified) {
      await this.auditService.logBiometricAuth(raw.userId, ipAddress, false, 'verification returned false');
      throw new UnauthorizedException('INVALID_ASSERTION');
    }

    await this.redisService.deleteFido2Challenge(challengeId);
    await this.authenticatorRepository.updateUsage(authenticator.id, verification.authenticationInfo.newCounter);

    const session = await this.sessionRepository.create({
      userId: raw.userId,
      ipAddress,
      deviceIdentifier,
    });
    await this.redisService.storeSession(session.id, raw.userId, session.expiresAt);

    const user = await this.userRepository.findById(raw.userId);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(user.id, user.email, session.id);
    await this.auditService.logBiometricAuth(user.id, ipAddress, true);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.jwtExpiresIn,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }
}
