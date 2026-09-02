import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { BlocksService } from './blocks.service.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
@Controller('blocks')
@UseGuards(AuthGuard('jwt'))
export class BlocksController {
  constructor(private svc: BlocksService){}
  @Get() list(){ return this.svc.list(); }
  @Get(':id') get(@Param('id') id:string){ const r=this.svc.get(id); if(!r) throw new NotFoundException(); return r; }
  @Post() @Roles('ADMIN','ENGINEERING_OFFICER','OPERATING_OFFICER','SSE_PWAY') create(@Body() dto:any){ return this.svc.create(dto); }
}
