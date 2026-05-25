import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const SAFE_ERROR_CODES = new Set([
  'UNAUTHORIZED', 'INVALID_CREDENTIALS', 'EMAIL_ALREADY_REGISTERED',
  'USERNAME_ALREADY_TAKEN', 'INVALID_USERNAME', 'INVALID_PASSWORD',
  'ACCOUNT_LOCKED', 'INVALID_ATTESTATION', 'CHALLENGE_EXPIRED',
  'INVALID_ASSERTION', 'INVALID_CURRENT_PASSWORD', 'AUTHENTICATOR_NOT_FOUND',
  'INTERNAL_SERVER_ERROR', 'INVALID_REFRESH_TOKEN', 'INVALID_NEW_PASSWORD',
  'VALIDATION_ERROR',
]);

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        const code = body.error as string;
        errorCode = SAFE_ERROR_CODES.has(code) ? code : 'INTERNAL_SERVER_ERROR';
        // Use provided message only if no sensitive content suspected
        message = typeof body.message === 'string' ? body.message : message;
      }
    } else {
      // Log unexpected errors internally but never expose them
      this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
