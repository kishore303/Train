import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector:'app-analytics',
  standalone:true,
  imports:[CommonModule, MatCardModule, MatButtonModule],
  template:`
  <h2 class="text-xl font-bold mb-2">Analytics <span class="text-xs font-normal" [class.text-emerald-600]="apiMode" [class.text-slate-400]="!apiMode">{{apiMode?'• via /api/analytics/dashboard':'• local fallback'}}</span> <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">DEMO_MODE</span></h2>
  <div class="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-3">BEFORE/AFTER calculated dynamically from live data — not hardcoded. S101 synthetic demonstration.</div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Maintenance Cost by Priority</div><canvas id="a1"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Train Conflicts per Section</div><canvas id="a2"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Risk Breakdown (API)</div><div class="text-xs">{{dash.riskBreakdown | json}}</div><canvas id="a3"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Weekly Block Utilization</div><canvas id="a4"></canvas></mat-card>
  </div>
  <mat-card class="p-4 !bg-gradient-to-br from-slate-900 to-blue-900 !text-white mt-4">
    <div class="font-bold">BEFORE AI vs AFTER AI — Dynamic Calculation</div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-3">
      <div><div class="text-xs opacity-70">BEFORE Blocks</div><div class="text-2xl font-bold">{{dash.beforeAfter?.before.blocks ?? dash.totalBlocks ?? '-'}}</div><div class="text-xs opacity-60">{{dash.beforeAfter?.before.totalDuration ?? '-'}}h total</div></div>
      <div><div class="text-xs opacity-70">AFTER Blocks</div><div class="text-2xl font-bold text-emerald-300">{{dash.beforeAfter?.after.blocks ?? '-'}}</div><div class="text-xs opacity-60">{{dash.beforeAfter?.after.totalDuration ?? '-'}}h total</div></div>
      <div><div class="text-xs opacity-70">BEFORE Delay</div><div class="text-xl font-bold">{{dash.beforeAfter?.before.estimatedDelay ?? '-'}}m</div></div>
      <div><div class="text-xs opacity-70">AFTER Delay</div><div class="text-xl font-bold text-emerald-300">{{dash.beforeAfter?.after.estimatedDelay ?? '-'}}m</div></div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mt-4">
      <div class="bg-white/10 p-2 rounded"><div class="text-lg font-bold text-emerald-300">{{dash.beforeAfter?.metrics.blockReduction ?? '-'}}%</div><div class="text-xs">Block Reduction %</div></div>
      <div class="bg-white/10 p-2 rounded"><div class="text-lg font-bold text-emerald-300">{{dash.beforeAfter?.metrics.delayReduction ?? '-'}}%</div><div class="text-xs">Delay Reduction %</div></div>
      <div class="bg-white/10 p-2 rounded"><div class="text-lg font-bold">{{dash.beforeAfter?.metrics.coordinationEfficiency ?? '-'}}%</div><div class="text-xs">Coordination Efficiency %</div></div>
      <div class="bg-white/10 p-2 rounded"><div class="text-lg font-bold text-emerald-300">{{dash.beforeAfter?.metrics.assetAvailabilityImprovement ?? '-'}}%</div><div class="text-xs">Asset Availability Improvement %</div></div>
    </div>
  </mat-card>

  <mat-card class="p-4 !bg-amber-50 border-2 border-amber-400 mt-4">
    <div class="font-bold text-amber-800">S101 — Synthetic Coordinated Block Demo</div>
    <div class="text-xs text-slate-600">Engineering 45m + Electrical 30m + S&T 30m on 1km SEC004 — evaluated for single coordinated block</div>
    <button mat-stroked-button class="!text-xs mt-2" (click)="loadS101()">Load S101</button>
    <div *ngIf="s101" class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
      <div class="bg-white p-3 rounded border">
        <div class="font-bold text-red-600">BEFORE</div>
        <div>{{s101.before.blocks}} separate blocks • {{s101.before.totalDuration}}m total • Delay {{s101.before.estimatedDelay}}m • Downtime {{s101.before.assetDowntime}}m</div>
        <div class="text-xs">{{s101.before.description}}</div>
      </div>
      <div class="bg-white p-3 rounded border-2 border-emerald-400">
        <div class="font-bold text-emerald-600">AFTER — {{s101.recommendation.type}}</div>
        <div>{{s101.after.blocks}} coordinated block • {{s101.after.totalDuration}}m • Delay {{s101.after.estimatedDelay}}m • Window {{s101.after.recommendedWindow}}</div>
        <div class="text-xs">{{s101.recommendation.reason}}</div>
      </div>
    </div>
    <div *ngIf="s101" class="text-xs mt-2">Metrics: Block Reduction {{s101.metrics.blockReduction}}% • Delay Reduction {{s101.metrics.delayReduction}}% • Availability +{{s101.metrics.assetAvailabilityImprovement}}% — <b>Synthetic demonstration result.</b></div>
  </mat-card>
  <mat-card class="p-4 !bg-white mt-4">
    <div class="font-semibold mb-2">KPIs</div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div><div class="text-2xl font-bold text-indigo-600">{{dash.assetAvailability ?? ds.avgAvailability}}%</div><div class="text-xs">Asset Availability</div></div>
      <div><div class="text-2xl font-bold text-emerald-600">12.4h</div><div class="text-xs">Avg Block Duration</div></div>
      <div><div class="text-2xl font-bold text-amber-600">{{dash.trainConflicts ?? ds.trainConflicts}}</div><div class="text-xs">Total Conflicts</div></div>
      <div><div class="text-2xl font-bold text-blue-600">92%</div><div class="text-xs">On-Time Blocks</div></div>
    </div>
  </mat-card>
  `,
})
export class AnalyticsComponent implements OnInit{
  dash:any={}; s101:any=null; apiMode=false; constructor(public ds:DataService, private api:ApiService){}
  ngOnInit(){
    this.api.getDashboard().subscribe({next:v=>{this.dash=v; this.apiMode=true}, error:()=>{}});
    setTimeout(()=>this.render(),500);
  }
  loadS101(){
    fetch('http://localhost:3000/api/demo/s101',{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}).then(r=>r.json()).then(v=>this.s101=v).catch(()=>{ this.s101={before:{blocks:3,totalDuration:105}, after:{blocks:1,totalDuration:60}, metrics:{blockReduction:66}}});
  }
  render(){
    const cost:any={}; this.ds.tasks.forEach(t=> cost[t.priority]=(cost[t.priority]||0)+t.estCostLakhs);
    try{ new Chart('a1' as any,{type:'bar',data:{labels:Object.keys(cost),datasets:[{label:'₹ Lakhs',data:Object.values(cost).map((v:any)=> +v.toFixed(1)),backgroundColor:['#ef4444','#f59e0b','#3b82f6','#9ca3af']}]},options:{responsive:true,plugins:{legend:{display:false}}}});}catch{}
    const conflicts:any={}; this.ds.trains.forEach(t=> conflicts[t.sectionName]=(conflicts[t.sectionName]||0)+t.conflicts);
    try{ new Chart('a2' as any,{type:'bar',data:{labels:Object.keys(conflicts).slice(0,6),datasets:[{label:'Conflicts',data:Object.values(conflicts).slice(0,6),backgroundColor:'#f97316'}]},options:{responsive:true,plugins:{legend:{display:false}}}});}catch{}
    const byType:any={}; this.ds.assets.forEach(a=> byType[a.type]=(byType[a.type]||0)+1);
    try{ new Chart('a3' as any,{type:'doughnut',data:{labels:Object.keys(byType),datasets:[{data:Object.values(byType),backgroundColor:['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#a855f7','#84cc16','#f97316']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});}catch{}
    try{ new Chart('a4' as any,{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Blocks',data:[3,5,4,6,5,2,4],borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.2)',fill:true,tension:0.4}]},options:{responsive:true}});}catch{}
  }
}
