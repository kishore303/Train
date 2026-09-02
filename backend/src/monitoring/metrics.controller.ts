import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { Public } from '../common/decorators/roles.decorator.js';
@Controller()
export class MetricsController {
  constructor(private m:MetricsService){}
  @Public()
  @Get('metrics')
  metrics(){ return this.m.prometheus(); }
  @Public()
  @Get('metrics.json')
  json(){ return {requests:this.m.requests, avgLatency:this.m.requests? this.m.latencyTotal/this.m.requests:0, optimizations:this.m.optimizations, predictions:this.m.predictions, ws:this.m.wsConnections, events:this.m.eventsProcessed, failed:this.m.failedEvents, activeBlocks:this.m.activeBlocks, replanning:this.m.replanningCount}; }
}
