import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class EnrollmentStartRequestDto {
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class EnrollmentStartResponseDto {
  challengeId!: string;
  options!: Record<string, unknown>;
}

export class EnrollmentVerifyRequestDto {
  @IsString()
  challengeId!: string;

  @IsObject()
  @IsNotEmpty()
  credential!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class EnrollmentVerifyResponseDto {
  authenticatorId!: string;
  deviceName?: string | null;
  enrolledAt!: string;
}
