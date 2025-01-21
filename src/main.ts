// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './filters/http-error.filter';
import compression from 'compression';
import { Logger } from '@nestjs/common';
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

  app.enableCors({
  origin: 'https://inventory-pos-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
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
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', 'https://inventory-pos-frontend.vercel.app');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).send();
    }
    next();
  });

  // Monitoreo periódico de memoria
  setInterval(logMemoryUsage, 300000); // cada 5 minutos

  // Configurar el heap limit
  const heapLimit = 450; // 450MB para Railway free tier
  process.env.NODE_OPTIONS = `--max-old-space-size=${heapLimit}`;

  Logger.log('Application is starting with all endpoints being tracked');
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
