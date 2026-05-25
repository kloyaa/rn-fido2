import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { PasswordService } from './password.service';
import { AuditService } from '../../audit/audit.service';
import { RegistrationRequestDto } from '../dto/registration.dto';
import { RegistrationResponseDto } from '../dto/registration.response.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegistrationRequestDto, ipAddress: string): Promise<RegistrationResponseDto> {
    const validationError = this.passwordService.validate(dto.password);
    if (validationError) {
      await this.auditService.logRegistration(null, ipAddress, false, validationError);
      throw new BadRequestException(validationError);
    }

    const emailTaken = await this.userRepository.emailExists(dto.email);
    if (emailTaken) {
      await this.auditService.logRegistration(null, ipAddress, false, 'email already registered');
      throw new ConflictException('EMAIL_ALREADY_EXISTS');
    }

    if (dto.username) {
      const usernameTaken = await this.userRepository.usernameExists(dto.username);
      if (usernameTaken) {
        await this.auditService.logRegistration(null, ipAddress, false, 'username already taken');
        throw new ConflictException('USERNAME_ALREADY_EXISTS');
      }
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    await this.auditService.logRegistration(user.id, ipAddress, true);

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
