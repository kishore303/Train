import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { AuthGuard } from '@nestjs/passport';
@Controller('events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private svc: EventsService){}
  @Get() list(){ return this.svc.list(); }
}
