import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn:'root'})
export class RealtimeService {
  private socket: Socket | null=null;
  events$ = new BehaviorSubject<any>(null);
  liveMetrics$ = new BehaviorSubject<any>(null);
  replanning$ = new BehaviorSubject<any>(null);
  connected=false;
  connect(){
    if(this.socket) return;
    this.socket = io('http://localhost:3000/live', {transports:['websocket','polling'], autoConnect:true});
    this.socket.on('connect',()=>{this.connected=true; console.log('WS connected');});
    this.socket.on('disconnect',()=>{this.connected=false;});
    const evs=['maintenanceUpdated','trainUpdated','blockUpdated','optimizationCompleted','approvalUpdated','systemAlert','liveMetricsUpdated','replanningStarted','replanningCompleted','block.requested','block.recommended'];
    evs.forEach(e=>{
      this.socket!.on(e, (payload:any)=>{
        this.events$.next({type:e, payload, ts: new Date().toISOString()});
        if(e==='replanningStarted' || e==='replanningCompleted') this.replanning$.next({type:e, payload});
        if(e==='liveMetricsUpdated') this.liveMetrics$.next(payload);
      });
    });
  }
  disconnect(){ this.socket?.disconnect(); this.socket=null; }
  on(event:string, cb:(d:any)=>void){ this.socket?.on(event, cb); }
}
