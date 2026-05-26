import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class AuthenticationVerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsObject()
  @IsNotEmpty()
  credential!: Record<string, unknown>;
}

export class AuthenticationVerifyResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  user!: {
    id: string;
    email: string;
    username?: string | null;
  };
}
