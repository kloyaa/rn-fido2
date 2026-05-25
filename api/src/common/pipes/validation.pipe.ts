import { BadRequestException, ValidationPipe as NestValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createValidationPipe(): NestValidationPipe {
  return new NestValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}).map((msg) => msg),
      );
      return new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: messages.join('; '),
      });
    },
  });
}
