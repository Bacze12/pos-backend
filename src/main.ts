// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './filters/http-error.filter';
import compression from 'compression';
import { Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';

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

  app.enableCors({
    origin: 'https://inventory-pos-frontend.vercel.app', // Dominios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type, Authorization', // Headers permitidos
    credentials: true, // Habilitar cookies si es necesario
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

  Logger.log('Application is starting with all endpoitns being tracked');
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
