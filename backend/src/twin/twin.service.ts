import { Injectable } from '@nestjs/common';
import { EventBusService } from '../realtime/event-bus.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
const AI='http://localhost:8000';
@Injectable()
export class TwinService {
  constructor(private bus: EventBusService, private ws: RealtimeGateway){}
  async graph(){ const r=await fetch(`${AI}/twin/graph`); return r.json(); }
  async assets(){ const r=await fetch(`${AI}/twin/assets`); return r.json(); }
  async metrics(){ const r=await fetch(`${AI}/twin/metrics`); return r.json(); }
  async blockStart(body:any){
    const r=await fetch(`${AI}/twin/block/start`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
    const j=await r.json();
    const ev=await this.bus.emitEvent('block.started', body);
    this.ws.broadcast('blockUpdated', j);
    this.ws.broadcast('asset.status_changed', j);
    return j;
  }
  async blockComplete(body:any){
    const r=await fetch(`${AI}/twin/block/complete`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
    const j=await r.json();
    const ev=await this.bus.emitEvent('block.completed', body);
    this.ws.broadcast('blockUpdated', j);
    return j;
  }
}
