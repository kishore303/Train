import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { AuthGuard } from '@nestjs/passport';
@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private svc: AnalyticsService){}
  @Get('dashboard') dash(){ return this.svc.dashboard(); }
}
