import { Controller, Get } from '@nestjs/common';
import { S101Service } from './s101.service.js';
@Controller('demo')
export class DemoController {
  constructor(private s101:S101Service){}
  @Get('s101') s101demo(){ return this.s101.scenario(); }
  @Get('health') health(){ return {demoMode: process.env.DEMO_MODE || 'true', mode:'synthetic', disclaimer:'Prototype / Demonstration System — Uses Synthetic Railway Data'}; }
}
