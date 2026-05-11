import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from './domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.resolveStatus(exception);

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
