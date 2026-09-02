import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../realtime/event-bus.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

type State = string;
export interface WorkflowDef { name:string; states:string[]; transitions: Record<string,string[]>; }

export const WORKFLOWS: Record<string, WorkflowDef> = {
  MaintenanceApprovalWorkflow: {
    name:'MaintenanceApprovalWorkflow',
    states:['REQUESTED','VERIFICATION','DEPARTMENT_REVIEW','OPERATING_REVIEW','AI_RECOMMENDED','AWAITING_APPROVAL','SCHEDULED','COMPLETED'],
    transitions:{
      REQUESTED:['VERIFICATION'], VERIFICATION:['DEPARTMENT_REVIEW'], DEPARTMENT_REVIEW:['OPERATING_REVIEW'], OPERATING_REVIEW:['AI_RECOMMENDED'], AI_RECOMMENDED:['AWAITING_APPROVAL'], AWAITING_APPROVAL:['SCHEDULED'], SCHEDULED:['COMPLETED']
    }
  },
  BlockPlanningWorkflow: {
    name:'BlockPlanningWorkflow',
    states:['DRAFT','COMPATIBILITY_CHECK','TRAIN_CONFLICT_CHECK','WINDOW_DETECTION','ORTOOLS_OPTIMIZE','RECOMMENDED','APPROVAL_PENDING','SCHEDULED'],
    transitions:{ DRAFT:['COMPATIBILITY_CHECK'], COMPATIBILITY_CHECK:['TRAIN_CONFLICT_CHECK'], TRAIN_CONFLICT_CHECK:['WINDOW_DETECTION'], WINDOW_DETECTION:['ORTOOLS_OPTIMIZE'], ORTOOLS_OPTIMIZE:['RECOMMENDED'], RECOMMENDED:['APPROVAL_PENDING'], APPROVAL_PENDING:['SCHEDULED']}
  },
  BlockExecutionWorkflow: {
    name:'BlockExecutionWorkflow',
    states:['SCHEDULED','BLOCKED','UNDER_MAINTENANCE','COMPLETED','RELEASED','AVAILABLE'],
    transitions:{ SCHEDULED:['BLOCKED'], BLOCKED:['UNDER_MAINTENANCE'], UNDER_MAINTENANCE:['COMPLETED'], COMPLETED:['RELEASED'], RELEASED:['AVAILABLE']}
  }
};

@Injectable()
export class WorkflowService {
  private logger=new Logger(WorkflowService.name);
  private temporalAvailable=false;
  private store=new Map<string,{workflow:string, current:string, history:string[]}>();
  constructor(private bus:EventBusService, private ws:RealtimeGateway){
    // try temporal connection, fallback to local state machine
    this.checkTemporal();
  }
  async checkTemporal(){
    try{
      // @ts-ignore try import temporal client if installed
      const mod=await import('@temporalio/client' as any);
      // if import succeeds, consider available — but we have no server, so fallback
      this.temporalAvailable=false;
    }catch{ this.temporalAvailable=false; this.logger.warn('Temporal unavailable — using local state-machine fallback (DEMO_MODE=true)');}
  }
  getDef(name:string){ return WORKFLOWS[name]; }
  start(workflow:string, id:string){
    const def=WORKFLOWS[workflow];
    if(!def) throw new Error('unknown workflow');
    const s={workflow, current:def.states[0], history:[def.states[0]]};
    this.store.set(id,s);
    this.bus.emitEvent('workflow.started' as any, {workflow,id,state:s.current});
    return s;
  }
  transition(id:string, to:string){
    const s=this.store.get(id);
    if(!s) throw new Error('workflow not started');
    const def=WORKFLOWS[s.workflow];
    const allowed=def.transitions[s.current]||[];
    if(!allowed.includes(to)) throw new Error(`Invalid transition ${s.current} → ${to}`);
    s.current=to; s.history.push(to);
    this.bus.emitEvent('workflow.transition' as any, {id, to});
    this.ws.broadcast('workflowUpdated', {id, workflow:s.workflow, state:to});
    return s;
  }
  get(id:string){ return this.store.get(id); }
  list(){ return Array.from(this.store.entries()).map(([id,v])=>({id,...v})); }
}
