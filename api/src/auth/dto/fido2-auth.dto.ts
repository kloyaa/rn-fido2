import { IsString, IsNotEmpty } from 'class-validator';

export class AuthenticationStartRequestDto {
  @IsString()
  @IsNotEmpty()
  username!: string;
}

export class AuthenticationStartResponseDto {
  challengeId!: string;
  options!: Record<string, unknown>;
}
