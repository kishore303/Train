import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from './event-bus.service.js';
import { RealtimeGateway } from './realtime.gateway.js';

@Injectable()
export class ReplanningService {
  private logger=new Logger(ReplanningService.name);
  constructor(private bus: EventBusService, private ws: RealtimeGateway){}
  async trigger(reason:string, payload:any){
    const startEvent=await this.bus.emitEvent('replanning.started', {reason, payload});
    this.ws.broadcast('replanningStarted', startEvent);
    // Re-evaluate via AI optimize (call python)
    let recommendation=null;
    try{
      const res=await fetch('http://localhost:8000/optimize',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({sectionId: payload.sectionId||'SEC001'})});
      recommendation=await res.json();
    }catch(e){ recommendation={error:'AI unavailable fallback', section: payload.sectionId}; }
    const completed=await this.bus.emitEvent('replanning.completed', {reason, recommendation});
    this.ws.broadcast('replanningCompleted', completed);
    this.ws.broadcast('optimizationCompleted', recommendation);
    // also broadcast systemAlert PLAN UPDATED
    this.ws.broadcast('systemAlert', {message:'PLAN UPDATED', reason, recommendation});
    this.logger.log(`Replanning ${reason} done`);
    return { status:'PLAN UPDATED', reason, recommendation, events:[startEvent, completed]};
  }
}
