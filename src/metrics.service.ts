// metrics.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger('MetricsService');
  private readonly metrics = new Map<string, any>();

  logEndpointMetrics(endpoint: string, memoryUsed: number, responseTime: number) {
    try {
      const current = this.metrics.get(endpoint) || {
        calls: 0,
        totalMemory: 0,
        totalTime: 0,
        lastCalled: null,
      };

      current.calls += 1;
      current.totalMemory += memoryUsed;
      current.totalTime += responseTime;
      current.lastCalled = new Date();
      current.avgMemory = current.totalMemory / current.calls;
      current.avgTime = current.totalTime / current.calls;

      this.metrics.set(endpoint, current);
      this.logger.debug(`Updated metrics for ${endpoint}: ${JSON.stringify(current)}`);
    } catch (error) {
      this.logger.error(`Error logging metrics for ${endpoint}:`, error);
    }
  }

  getMetrics() {
    const endpointMetrics = Array.from(this.metrics.entries()).map(([endpoint, data]) => ({
      endpoint,
      ...data,
      avgMemoryMB: Math.round((data.avgMemory / 1024 / 1024) * 100) / 100,
      avgTimeMs: Math.round(data.avgTime),
    }));

    return {
      summary: {
        totalEndpoints: this.metrics.size,
        totalCalls: Array.from(this.metrics.values()).reduce((sum, data) => sum + data.calls, 0),
        timestamp: new Date().toISOString(),
      },
      system: {
        memory: {
          ...process.memoryUsage(),
          heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          rssInMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        uptime: Math.round(process.uptime()),
      },
      endpoints: endpointMetrics,
    };
  }
}
