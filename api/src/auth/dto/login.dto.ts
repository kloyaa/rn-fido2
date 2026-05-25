import { IsString, IsNotEmpty, ValidateIf, IsEmail } from 'class-validator';

export class LoginRequestDto {
  @ValidateIf((o) => !o.username)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
