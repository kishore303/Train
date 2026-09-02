import { Module, MiddlewareConsumer, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';
import { MetricsMiddleware } from './metrics.middleware.js';

@Global()
@Module({ providers:[MetricsService, MetricsMiddleware], controllers:[MetricsController], exports:[MetricsService] })
export class MonitoringModule {
  configure(consumer: MiddlewareConsumer){ consumer.apply(MetricsMiddleware).forRoutes('*'); }
}
