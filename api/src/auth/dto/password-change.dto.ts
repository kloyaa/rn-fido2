import { IsString, MinLength, MaxLength } from 'class-validator';

export class PasswordChangeRequestDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword!: string;
}

export class PasswordChangeResponseDto {
  message!: string;
}
