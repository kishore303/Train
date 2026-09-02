import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service.js';
import { RedisService } from './redis.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { ReplanningService } from './replanning.service.js';

@Global()
@Module({
  providers:[EventBusService, RedisService, RealtimeGateway, ReplanningService],
  exports:[EventBusService, RedisService, RealtimeGateway, ReplanningService],
})
export class RealtimeModule {}
