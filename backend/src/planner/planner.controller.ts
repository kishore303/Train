import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PlannerService } from './planner.service.js';
import { ReplanningService } from '../realtime/replanning.service.js';

@Controller('planner')
export class PlannerController {
  constructor(private svc: PlannerService, private replanning: ReplanningService) {}

  @Post('optimize')
  async optimize(@Body() body: any) {
    return this.svc.optimize(body);
  }

  @Post('simulate')
  async simulate(@Body() body: any) {
    return this.svc.simulate(body);
  }

  @Get('recommendations')
  async recommendations(@Query('sectionId') sectionId: string) {
    return this.svc.recommendations(sectionId || 'SEC001');
  }

  @Post('predict/duration')
  async predDur(@Body() body: any) { return this.svc.predictDuration(body); }

  @Post('predict/risk')
  async predRisk(@Body() body: any) { return this.svc.predictRisk(body); }

  @Post('predict/delay')
  async predDelay(@Body() body: any) { return this.svc.predictDelay(body); }
  @Post('whatif')
  async whatif(@Body() body:any){ return this.svc.whatif(body); }
  @Post('replan')
  async replan(@Body() body:any){ return this.replanning.trigger(body.reason||'manual', body.payload||body); }
  @Post('simulate')
  async simulateAlias(@Body() body:any){ return this.svc.simulate(body); }
}
