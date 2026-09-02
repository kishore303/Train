import { Controller, Get, Post, Put, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('maintenance')
@UseGuards(AuthGuard('jwt'))
export class MaintenanceController {
  constructor(private svc: MaintenanceService) {}
  @Get() getAll() { return this.svc.list(); }
  @Get(':id') getOne(@Param('id') id: string) { const r=this.svc.get(id); if(!r) throw new NotFoundException(); return r; }
  @Post() @Roles('ADMIN','ENGINEERING_OFFICER','SSE_PWAY','JE_PWAY','MAINTENANCE_STAFF') create(@Body() dto: any) { return this.svc.create(dto); }
  @Put(':id') @Roles('ADMIN','ENGINEERING_OFFICER','SSE_PWAY') update(@Param('id') id:string,@Body() dto:any){ const r=this.svc.update(id,dto); if(!r) throw new NotFoundException(); return r; }
}
