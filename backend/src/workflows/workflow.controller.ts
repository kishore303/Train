import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WorkflowService } from './workflow.service.js';
@Controller('workflows')
export class WorkflowController {
  constructor(private svc:WorkflowService){}
  @Get() list(){ return this.svc.list(); }
  @Get(':id') get(@Param('id') id:string){ return this.svc.get(id); }
  @Post('start') start(@Body() b:any){ return this.svc.start(b.workflow, b.id||`wf-${Date.now()}`); }
  @Post(':id/transition') trans(@Param('id') id:string, @Body() b:any){ return this.svc.transition(id, b.to); }
  @Get('defs/list') defs(){ return this.svc['store'] ? Object.keys(this.svc['store']) : []; }
}
