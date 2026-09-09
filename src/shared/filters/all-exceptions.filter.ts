import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse && typeof exceptionResponse === 'object'
          ? (exceptionResponse as { message?: string | string[] }).message
          : 'Internal server error';

    const errorDetails = {
      method: request.method,
      path: request.url,
      statusCode: status,
      message,
      exception:
        exception instanceof Error ? exception.message : String(exception),
    };
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(JSON.stringify(errorDetails), stack);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
