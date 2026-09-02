import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { TrainsService } from './trains.service.js';
import { AuthGuard } from '@nestjs/passport';
@Controller('trains')
@UseGuards(AuthGuard('jwt'))
export class TrainsController {
  constructor(private svc: TrainsService){}
  @Get() list(){ return this.svc.list(); }
  @Get(':id') get(@Param('id') id:string){ const r=this.svc.get(id); if(!r) throw new NotFoundException(); return r; }
}
