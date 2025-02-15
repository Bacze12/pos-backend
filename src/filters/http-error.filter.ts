import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common'; // Importa BadRequestException
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const errorResponse: any = {
      // Cambia a 'any' para poder añadir 'errors'
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || null,
    };

    // *** Modificación aquí:  Manejo específico para BadRequestException ***
    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse() as any; // Castea a 'any' para acceder a 'errors'
      if (validationErrors.errors) {
        errorResponse.errors = validationErrors.errors; // Añade 'errors' a la respuesta
        errorResponse.message = 'Error de validación'; // Mensaje general, o puedes usar uno más específico si lo deseas
      }
    }

    response.status(status).json(errorResponse);
  }
}
