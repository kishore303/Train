import { Controller, Get, Post, Body } from '@nestjs/common';
import { TwinService } from './twin.service.js';
@Controller('twin')
export class TwinController {
  constructor(private svc: TwinService){}
  @Get('graph') graph(){ return this.svc.graph(); }
  @Get('assets') assets(){ return this.svc.assets(); }
  @Get('metrics') metrics(){ return this.svc.metrics(); }
  @Post('block/start') start(@Body() b:any){ return this.svc.blockStart(b); }
  @Post('block/complete') complete(@Body() b:any){ return this.svc.blockComplete(b); }
}
