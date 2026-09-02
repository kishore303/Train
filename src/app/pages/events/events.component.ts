import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { RealtimeService } from '../../core/realtime.service';

@Component({
  selector:'app-events',
  standalone:true,
  imports:[CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Events & Notifications <span class="text-xs px-2 py-1 rounded" [class.bg-emerald-100]="rt.connected" [class.text-emerald-700]="rt.connected" [class.bg-slate-100]="!rt.connected">{{rt.connected ? '● Live WS /live' : '○ WS disconnected (fallback polling)'}}</span> <span class="text-xs font-normal text-slate-400">• Kafka: {{rt.connected?'in-memory + WS':'fallback'}} • Redis: in-memory</span></h2>
  <p class="text-sm text-slate-500 mb-3">Topics: maintenance.created/block.* /train.* /asset.* /optimization.* /replanning.* — WebSocket live: maintenanceUpdated/trainUpdated/blockUpdated/optimizationCompleted/systemAlert/replanning*</p>
  <div class="flex gap-2 mb-3">
    <button mat-stroked-button class="!text-xs" (click)="trigger('train.delayed')">Test train.delayed → replanning</button>
    <button mat-stroked-button class="!text-xs" (click)="trigger('maintenance.created')">Test emergency maintenance</button>
    <button mat-stroked-button class="!text-xs" (click)="clear()">Clear live</button>
  </div>
  <div *ngIf="live.length" class="mb-3">
    <div class="text-xs font-bold text-emerald-700">Live Feed (WebSocket)</div>
    <mat-card *ngFor="let e of live" class="p-3 !bg-emerald-50 border-l-4 !border-emerald-500 mb-2 flex gap-3">
      <mat-icon>live_tv</mat-icon>
      <div class="flex-1">
        <div class="font-semibold text-sm">{{e.type}} <span class="text-xs text-slate-500">{{e.ts}}</span></div>
        <div class="text-xs">{{e.payload | json}}</div>
      </div>
    </mat-card>
  </div>
  <div class="space-y-3">
    <mat-card *ngFor="let e of list" class="p-4 !bg-white flex gap-3 border-l-4" [ngClass]="e.color || '!border-slate-300'">
      <mat-icon>{{e.icon || 'notifications'}}</mat-icon>
      <div class="flex-1">
        <div class="font-semibold text-sm">{{e.title}} <span class="text-xs font-normal text-slate-500">• {{e.time}}</span></div>
        <div class="text-xs text-slate-600">{{e.desc || e.description}}</div>
      </div>
      <span class="text-xs px-2 py-1 rounded h-fit" [ngClass]="e.badge || 'bg-slate-100'">{{e.level || e.type}}</span>
    </mat-card>
  </div>
  `,
})
export class EventsComponent implements OnInit, OnDestroy{
  apiMode=false; list:any[]=[]; live:any[]=[];
  events=[
    {title:'Block BLK003 activated',time:'Today 02:00',desc:'Engineering block on NDLS-AGC started.',level:'INFO',icon:'construction',color:'!border-blue-500',badge:'bg-blue-100 text-blue-700'},
    {title:'High priority task flagged',time:'Today 08:30',desc:'MNT007 Track Renewal at BCT-ST marked Critical',level:'CRITICAL',icon:'warning',color:'!border-red-500',badge:'bg-red-100 text-red-700'},
    {title:'Train conflict detected',time:'Today 09:15',desc:'12019 Shatabdi vs Freight overlap on AGC-BPL',level:'WARN',icon:'directions_railway',color:'!border-amber-500',badge:'bg-amber-100 text-amber-700'},
  ];
  constructor(private api:ApiService, public rt:RealtimeService){}
  ngOnInit(){
    this.list=this.events; this.api.getEvents().subscribe({next:v=>{this.list=v; this.apiMode=true}, error:()=>{}});
    this.rt.connect();
    this.rt.events$.subscribe(e=>{ if(e && e.type) this.live=[e, ...this.live].slice(0,20); });
  }
  ngOnDestroy(){}
  trigger(topic:string){
    const payload={sectionId:'SEC001', reason:topic, ts: new Date().toISOString()};
    fetch('http://localhost:3000/api/planner/replan',{method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}`}, body: JSON.stringify({reason:topic, payload})}).then(r=>r.json()).then(j=>{ this.live=[{type:'replanningCompleted', payload:j, ts:new Date().toISOString()}, ...this.live].slice(0,20); }).catch(()=>{});
  }
  clear(){ this.live=[]; }
}
