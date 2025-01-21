// memory-tracking.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics.service';

@Injectable()
export class MemoryTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('MemoryTracking');

  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.route?.path || req.originalUrl; // Fallback al originalUrl si route.path no existe
    const endpoint = `${method} ${path}`;

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    this.logger.debug(`Starting request tracking for: ${endpoint}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const usedMemory = process.memoryUsage().heapUsed - startMemory;
          const responseTime = endTime - startTime;

          this.logger.debug(`Completed request tracking for: ${endpoint}`);
          this.metricsService.logEndpointMetrics(endpoint, usedMemory, responseTime);
        },
        error: (error) => {
          this.logger.error(`Error in request: ${endpoint}`, error);
        },
      }),
    );
  }
}
