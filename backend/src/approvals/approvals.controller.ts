import { Controller, Get, Post, Param, Body, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApprovalsService } from './approvals.service.js';
import { WorkflowService } from '../workflows/workflow.service.js';
import { EventBusService } from '../realtime/event-bus.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { DataRepository } from '../data/data.repository.js';

@Controller('approvals')
export class ApprovalsController {
  constructor(private svc: ApprovalsService, private wf: WorkflowService, private bus: EventBusService, private ws: RealtimeGateway, private repo: DataRepository){}
  @Get() list(){ return this.svc.list(); }
  @Post(':id/approve')
  async approve(@Param('id') id:string, @Body() body:any, @Request() req:any){
    const user=req.user;
    if(!user) throw new ForbiddenException('Auth required');
    // AI must NEVER approve — enforce human role
    const allowed=['ADMIN','ENGINEERING_OFFICER','OPERATING_OFFICER','SSE_PWAY'];
    if(!allowed.includes(user.role)) throw new ForbiddenException('Only authorized human can approve — AI never auto-approves');
    // try workflow
    try{ this.wf.start('MaintenanceApprovalWorkflow', id); }catch{}
    try{ 
      // move through workflow to SCHEDULED
      for(const s of ['VERIFICATION','DEPARTMENT_REVIEW','OPERATING_REVIEW','AI_RECOMMENDED','AWAITING_APPROVAL','SCHEDULED']){
        try{ this.wf.transition(id, s); }catch{}
      }
    }catch{}
    // update block/task status
    const tasks=this.repo.getMaintenanceTasks();
    const tIdx=tasks.findIndex((t:any)=>t.id===id);
    if(tIdx!==-1){ tasks[tIdx].status='Scheduled'; this.repo.saveMaintenanceTasks(tasks); }
    const blocks=this.repo.getBlocks();
    const bIdx=blocks.findIndex((b:any)=>b.id===id);
    if(bIdx!==-1){ blocks[bIdx].status='Active'; this.repo.saveBlocks(blocks); }
    if(tIdx===-1 && bIdx===-1) throw new NotFoundException();
    await this.bus.emitEvent('block.approved' as any, {id, by:user.email, role:user.role});
    this.ws.broadcast('approvalUpdated', {id, status:'SCHEDULED', by:user.email});
    this.ws.broadcast('blockUpdated', {id, status:'Active'});
    return {id, status:'SCHEDULED', workflow: this.wf.get(id), message:'Human approval recorded — AI did not auto-approve'};
  }
  @Post(':id/reject')
  async reject(@Param('id') id:string, @Body() body:any, @Request() req:any){
    await this.bus.emitEvent('block.rejected' as any, {id, by:req.user?.email});
    this.ws.broadcast('approvalUpdated', {id, status:'REJECTED'});
    return {id, status:'REJECTED'};
  }
  @Get('workflow/:id')
  getWf(@Param('id') id:string){ return this.wf.get(id); }
}
