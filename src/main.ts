// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './filters/http-error.filter';
import compression from 'compression';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

const logger = new Logger('Memory');

function logMemoryUsage() {
  const used = process.memoryUsage();
  logger.log(`Memory Usage:
    RSS: ${Math.round(used.rss / 1024 / 1024)}MB
    Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)}MB
    Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // Esto es importante para mostrar los mensajes de error
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const errorMessages = {};
        errors.forEach((err) => {
          errorMessages[err.property] = Object.values(err.constraints);
        });

        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: errorMessages,
        });
      },
    }),
  );

  app.enableCors({
    origin: [
      'https://inventory-pos-frontend.vercel.app',
      'http://localhost:3000',
      'http://0.0.0.0:3000',
      'http://127.0.0.1:3000',
    ], // Permitir solo estas solicitudes
    // origin: '*', // Permitir todas las solicitudes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });
  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Inventory POS API')
    .setDescription('API para el sistema de inventario y punto de venta')
    .setVersion('1.0')
    .addTag('inventory')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Guardar el JSON generado por Swagger en un archivo
  const swaggerJsonPath = './swagger.json';
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));

  SwaggerModule.setup('api', app, document);

  // Endpoint para descargar el archivo JSON
  app.getHttpAdapter().get('/swagger-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.download(swaggerJsonPath, 'swagger.json');
  });

  // Comprimir respuestas
  app.use(compression());

  // Configurar límites globales
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  app.useGlobalFilters(new HttpErrorFilter());

  // Monitoreo periódico de memoria
  setInterval(logMemoryUsage, 300000); // cada 5 minutos

  // Configurar el heap limit
  const heapLimit = 450; // 450MB para Railway free tier
  process.env.NODE_OPTIONS = `--max-old-space-size=${heapLimit}`;

  Logger.log('Application is starting with all endpoints being tracked');
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
