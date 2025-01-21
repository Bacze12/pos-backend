// metrics.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger('MetricsController');

  constructor(private metricsService: MetricsService) {}

  @Get()
  getMetrics() {
    this.logger.debug('Getting metrics...');
    const metrics = this.metricsService.getMetrics();
    this.logger.debug(`Retrieved metrics: ${JSON.stringify(metrics)}`);
    return metrics;
  }
}
