import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  validate(password: string): string | null {
    const errors: string[] = [];

    if (password.length < 12) errors.push('at least 12 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one digit');
    if (!/[!@#$%^&*]/.test(password)) errors.push('one special character (!@#$%^&*)');

    return errors.length > 0
      ? `Password must contain: ${errors.join(', ')}`
      : null;
  }
}
