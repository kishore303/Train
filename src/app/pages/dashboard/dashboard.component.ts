import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector:'app-dashboard',
  standalone:true,
  imports:[CommonModule, MatCardModule, MatIconModule],
  template:`
  <h2 class="text-xl font-bold mb-4">Dashboard Overview <span class="text-xs font-normal text-emerald-600" *ngIf="apiMode">• via /api/analytics/dashboard</span><span class="text-xs font-normal text-slate-400" *ngIf="!apiMode">• local fallback</span></h2>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    <mat-card class="p-4 !bg-white border-l-4 border-amber-500">
      <div class="text-xs text-slate-500 uppercase">Pending Tasks</div>
      <div class="text-3xl font-bold">{{dash.pendingTasks ?? ds.pendingTasks}}</div>
      <div class="text-xs text-amber-600">Awaiting scheduling</div>
    </mat-card>
    <mat-card class="p-4 !bg-white border-l-4 border-red-500">
      <div class="text-xs text-slate-500 uppercase">High Priority</div>
      <div class="text-3xl font-bold text-red-600">{{dash.highPriority ?? ds.highPriority}}</div>
      <div class="text-xs text-red-500">Critical + High</div>
    </mat-card>
    <mat-card class="p-4 !bg-white border-l-4 border-blue-600">
      <div class="text-xs text-slate-500 uppercase">Active Blocks</div>
      <div class="text-3xl font-bold text-blue-600">{{dash.activeBlocks ?? ds.activeBlocks}}</div>
      <div class="text-xs text-slate-500">Currently enforced</div>
    </mat-card>
    <mat-card class="p-4 !bg-white border-l-4 border-emerald-500">
      <div class="text-xs text-slate-500 uppercase">Recommended Blocks</div>
      <div class="text-3xl font-bold text-emerald-600">{{dash.recommendedBlocks ?? ds.recommendedBlocks}}</div>
      <div class="text-xs text-slate-500">AI suggested</div>
    </mat-card>
    <mat-card class="p-4 !bg-white border-l-4 border-orange-500">
      <div class="text-xs text-slate-500 uppercase">Train Conflicts</div>
      <div class="text-3xl font-bold text-orange-600">{{dash.trainConflicts ?? ds.trainConflicts}}</div>
      <div class="text-xs text-slate-500">Potential overlaps</div>
    </mat-card>
    <mat-card class="p-4 !bg-white border-l-4 border-indigo-600">
      <div class="text-xs text-slate-500 uppercase">Asset Availability</div>
      <div class="text-3xl font-bold text-indigo-600">{{dash.assetAvailability ?? ds.avgAvailability}}%</div>
      <div class="text-xs text-emerald-600">Risk engine active</div>
    </mat-card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Tasks by Priority (incl. riskScore)</div><canvas id="c1" height="200"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Blocks by Status</div><canvas id="c2" height="200"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Asset Availability Trend</div><canvas id="c3" height="200"></canvas></mat-card>
    <mat-card class="p-4 !bg-white"><div class="font-semibold mb-2">Asset Condition</div><canvas id="c4" height="200"></canvas></mat-card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <mat-card class="p-4 !bg-white">
      <div class="font-semibold mb-2">Recent Tasks (riskScore)</div>
      <table class="w-full text-sm">
        <tr class="text-slate-500 border-b"><th class="text-left py-2">ID</th><th class="text-left">Title</th><th>Risk</th><th>Section</th></tr>
        <tr *ngFor="let t of tasks | slice:0:5" class="border-b">
          <td class="py-2 font-mono text-xs">{{t.id}}</td><td>{{t.title}}</td><td><span class="px-2 py-0.5 rounded text-xs font-bold" [ngClass]="{'bg-red-600 text-white':t.riskScore>=80,'bg-orange-500 text-white':t.riskScore>=60,'bg-blue-100 text-blue-700':t.riskScore>=40}">{{t.riskScore ?? '-'}} {{t.computedPriority||''}}</span></td><td class="text-xs">{{t.sectionName}}</td>
        </tr>
      </table>
    </mat-card>
    <mat-card class="p-4 !bg-white">
      <div class="font-semibold mb-2">Upcoming Blocks</div>
      <table class="w-full text-sm">
        <tr class="text-slate-500 border-b"><th class="text-left py-2">Block</th><th>Section</th><th>Status</th><th>Conflicts</th></tr>
        <tr *ngFor="let b of blocks | slice:0:5" class="border-b">
          <td class="py-2 font-mono text-xs">{{b.id}}</td><td class="text-xs">{{b.sectionName}}</td><td><span class="px-2 py-0.5 rounded text-xs" [ngClass]="{'bg-blue-100 text-blue-700':b.status==='Active','bg-amber-100 text-amber-700':b.status==='Planned'}">{{b.status}}</span></td><td class="text-center">{{b.conflicts}}</td>
        </tr>
      </table>
    </mat-card>
  </div>
  `,
})
export class DashboardComponent implements OnInit {
  dash:any={}; apiMode=false; tasks:any[]=[]; blocks:any[]=[];
  constructor(public ds: DataService, private api: ApiService){}
  ngOnInit(){
    this.tasks=this.ds.tasks; this.blocks=this.ds.blocks;
    this.api.getDashboard().subscribe({next:v=>{this.dash=v; this.apiMode=true;}, error:()=>{}});
    this.api.getMaintenance().subscribe({next:v=>{this.tasks=v;}, error:()=>{}});
    this.api.getBlocks().subscribe({next:v=>{this.blocks=v;}, error:()=>{}});
    setTimeout(()=>this.render(),500);
  }
  render(){
    const pri:any={'Critical':0,'High':0,'Medium':0,'Low':0}; this.tasks.forEach((t:any)=> pri[t.priority as keyof typeof pri]++ );
    try{ new Chart('c1' as any,{type:'doughnut',data:{labels:Object.keys(pri),datasets:[{data:Object.values(pri),backgroundColor:['#ef4444','#f59e0b','#3b82f6','#10b981']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});}catch{}
    const st:any={}; this.blocks.forEach((b:any)=> st[b.status]=(st[b.status]||0)+1);
    try{ new Chart('c2' as any,{type:'bar',data:{labels:Object.keys(st),datasets:[{label:'Blocks',data:Object.values(st),backgroundColor:'#6366f1'}]},options:{responsive:true,plugins:{legend:{display:false}}}});}catch{}
    try{ new Chart('c3' as any,{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Availability %',data:[84,85,83,86,87,85,88],borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.2)',fill:true,tension:0.4}]},options:{responsive:true}});}catch{}
    const cond:any={}; this.ds.assets.forEach(a=> cond[a.condition]=(cond[a.condition]||0)+1);
    try{ new Chart('c4' as any,{type:'pie',data:{labels:Object.keys(cond),datasets:[{data:Object.values(cond),backgroundColor:['#10b981','#f59e0b','#ef4444','#991b1b']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});}catch{}
  }
}
