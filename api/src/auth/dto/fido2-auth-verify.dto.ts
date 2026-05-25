import { IsString, IsNotEmpty } from 'class-validator';

export class AuthenticationVerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

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
