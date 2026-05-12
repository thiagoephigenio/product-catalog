import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { DomainException } from './domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(DomainExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = this.resolveStatus(exception);

    const correlationId = request.headers['x-correlation-id'] as
      | string
      | undefined;
    const logLevel = status >= 500 ? 'error' : 'warn';

    this.logger[logLevel](
      {
        action: `${request.method.toLowerCase()} ${request.path}`,
        correlationId,
        error: exception.name,
      },
      exception.message,
    );

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }

  private resolveStatus(exception: DomainException): number {
    switch (exception.name) {
      case 'ProductNotFoundException':
      case 'CategoryNotFoundException':
        return HttpStatus.NOT_FOUND;
      case 'DuplicateProductNameException':
      case 'DuplicateCategoryNameException':
        return HttpStatus.CONFLICT;
      default:
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }
  }
}
