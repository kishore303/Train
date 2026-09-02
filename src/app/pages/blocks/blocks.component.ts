import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector:'app-blocks',
  standalone:true,
  imports:[CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Block Planner <span class="text-xs font-normal" [class.text-emerald-600]="apiMode" [class.text-slate-400]="!apiMode">{{apiMode?'• Nest ↔ FastAPI':'• local fallback'}}</span></h2>
  <div class="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-3">AI model trained on synthetic demonstration data. Never claim production ML accuracy. AI only RECOMMENDS — human approval mandatory.</div>
  <p class="text-sm text-slate-500 mb-4">OR-Tools CP-SAT + XGBoost/RF + Compatibility + Train Conflict + Window Detection</p>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
    <mat-card class="p-4 !bg-gradient-to-br from-indigo-600 to-blue-700 !text-white">
      <div class="text-sm opacity-90">Recommended Blocks</div><div class="text-3xl font-bold">{{recommendedCount}}</div><div class="text-xs opacity-80">via API</div>
    </mat-card>
    <mat-card class="p-4 !bg-white"><div class="text-sm text-slate-500">Active</div><div class="text-3xl font-bold text-blue-600">{{activeCount}}</div></mat-card>
    <mat-card class="p-4 !bg-white"><div class="text-sm text-slate-500">Total Blocks</div><div class="text-3xl font-bold">{{list.length}}</div></mat-card>
  </div>

  <mat-card class="p-4 !bg-white mb-4">
    <div class="font-semibold mb-2">AI Planning Engine</div>
    <div class="flex flex-wrap gap-3 items-end">
      <mat-form-field appearance="outline">
        <mat-label>Section</mat-label>
        <mat-select [(value)]="sectionId">
          <mat-option *ngFor="let s of ds.sections" [value]="s.id">{{s.code}} — {{s.name}}</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-flat-button color="primary" (click)="optimize()" [disabled]="loading">{{loading?'Optimizing…':'AI Optimize (OR-Tools)'}}</button>
      <button mat-stroked-button (click)="simulate()">Simulate Windows</button>
      <button mat-stroked-button (click)="recommend()">Recommend</button>
      <span class="text-xs" [class.text-emerald-600]="rec" [class.text-slate-400]="!rec">{{rec ? '• '+rec.aiMode : '• idle'}}</span>
    </div>
    <div *ngIf="error" class="text-xs text-red-600 mt-2">{{error}}</div>
  </mat-card>

  <mat-card *ngIf="rec" class="p-4 !bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-400 mb-4">
    <div class="font-bold text-emerald-800">AI OPTIMAL BLOCK — {{rec.section}} — {{rec.recommendedWindow}}</div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
      <div><div class="text-xs text-slate-500">Section</div><div class="font-semibold">{{rec.section}}</div></div>
      <div><div class="text-xs text-slate-500">Recommended Window</div><div class="font-semibold text-blue-700">{{rec.recommendedWindow}} ({{rec.start}}–{{rec.end}})</div></div>
      <div><div class="text-xs text-slate-500">Departments</div><div class="font-semibold">{{rec.departments?.join(', ')}}</div></div>
      <div><div class="text-xs text-slate-500">Optimization Score</div><div class="font-bold text-emerald-600">{{rec.optimizationScore}}/100</div></div>
      <div><div class="text-xs text-slate-500">Tasks</div><div class="font-mono text-xs">{{rec.tasks?.join(', ')}}</div></div>
      <div><div class="text-xs text-slate-500">Affected Trains</div><div class="font-semibold">{{rec.affectedCount}} (delay {{rec.predictedDelayMin}} min)</div></div>
      <div><div class="text-xs text-slate-500">Compatibility</div><span class="px-2 py-1 rounded text-xs font-bold" [ngClass]="rec.compatibility==='COMPATIBLE'?'bg-emerald-600 text-white':'bg-red-600 text-white'">{{rec.compatibility}}</span></div>
      <div><div class="text-xs text-slate-500">AI Mode</div><div class="text-xs">{{rec.aiMode}}</div></div>
    </div>
    <div class="text-xs mt-2"><b>Reasons:</b> {{rec.reasons?.join(' • ')}}</div>
    <div class="text-xs mt-1"><b>Compatibility:</b> {{rec.compatibilityReasons?.join(' • ')}}</div>
    <div *ngIf="rec.affectedTrains?.length" class="text-xs mt-2"><b>Affected trains:</b> <span *ngFor="let t of rec.affectedTrains" class="mr-2">{{t.train}} ({{t.type}}) +{{t.delayMin}}m</span></div>
    <mat-card class="p-3 !bg-white mt-3">
      <div class="font-semibold text-xs">WHY DID AI GIVE THIS RECOMMENDATION? — SHAP</div>
      <div class="text-xs text-slate-600">{{rec.shap?.summary}}</div>
      <div class="text-xs mt-1"><span *ngFor="let f of rec.shap?.topFeatures" class="bg-slate-100 px-2 py-1 rounded mr-1">{{f}}</span></div>
      <div class="text-xs text-slate-400 mt-1">Method: {{rec.shap?.method}}</div>
    </mat-card>
    <div class="text-xs text-slate-500 mt-2">{{rec.disclaimer}}</div>
    <div class="mt-3 p-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded">AI RECOMMENDS ONLY — requires human approval (ADMIN/ENGINEERING_OFFICER). Create block with this window via POST /api/blocks after approval.</div>
  </mat-card>

  <mat-card *ngIf="windows.length" class="p-4 !bg-white mb-4">
    <div class="font-semibold mb-2">Available Window Detection</div>
    <table class="w-full text-xs">
      <tr class="bg-slate-50 text-slate-500"><th class="text-left p-2">Window</th><th>Status</th><th>Reason</th><th>Affected</th><th>Delay</th></tr>
      <tr *ngFor="let w of windows" class="border-t">
        <td class="p-2 font-mono">{{w.window}}</td>
        <td><span class="px-2 py-1 rounded text-xs font-bold" [ngClass]="{'bg-emerald-100 text-emerald-700':w.status==='FEASIBLE','bg-red-100 text-red-700':w.status==='TRAIN CONFLICT','bg-amber-100 text-amber-700':w.status==='INSUFFICIENT'}">{{w.status}}</span></td>
        <td>{{w.reason}}</td><td class="text-center">{{w.affected}}</td><td class="text-center">{{w.delay}}m</td>
      </tr>
    </table>
    <div class="text-xs text-slate-400 mt-2">Example mapping as spec: 01:00–02:00 INSUFFICIENT/FEASIBLE, 02:00–03:30 FEASIBLE, 03:30–04:00 TRAIN CONFLICT/INSUFFICIENT, 04:00–05:00 FEASIBLE</div>
  </mat-card>

  <mat-card class="!bg-white overflow-auto">
    <div class="p-3 font-semibold">Existing Blocks ({{list.length}})</div>
    <table class="w-full text-sm">
      <thead class="bg-slate-50 text-slate-500"><tr><th class="text-left p-3">Block</th><th>Section</th><th>KM</th><th>Window</th><th>Status</th><th>Type</th><th>Conflicts</th></tr></thead>
      <tbody>
        <tr *ngFor="let b of list" class="border-t hover:bg-slate-50" [class.bg-emerald-50]="b.recommended">
          <td class="p-3 font-mono text-xs">{{b.id}} <span *ngIf="b.recommended" class="bg-emerald-600 text-white text-[10px] px-1 rounded ml-1">RECOMMENDED</span></td>
          <td class="text-xs">{{b.sectionName}}</td><td class="text-xs">{{b.kmFrom}}-{{b.kmTo}}</td><td class="text-xs">{{b.start | date:'short'}} → {{b.end | date:'short'}}</td>
          <td><span class="text-xs px-2 py-1 rounded" [ngClass]="{'bg-blue-100 text-blue-700':b.status==='Active','bg-amber-100 text-amber-700':b.status==='Planned'}">{{b.status}}</span></td>
          <td class="text-xs">{{b.type}}</td><td class="text-center font-bold" [class.text-red-600]="b.conflicts>2">{{b.conflicts}}</td>
        </tr>
      </tbody>
    </table>
  </mat-card>
  `,
})
export class BlocksComponent implements OnInit{
  list:any[]=[]; apiMode=false; sectionId='SEC001'; rec:any=null; windows:any[]=[]; loading=false; error='';
  constructor(public ds:DataService, private api:ApiService){}
  get recommendedCount(){ return this.list.filter((b:any)=>b.recommended).length; }
  get activeCount(){ return this.list.filter((b:any)=>b.status==='Active').length; }
  ngOnInit(){ this.list=this.ds.blocks; this.api.getBlocks().subscribe({next:v=>{this.list=v; this.apiMode=true}, error:()=>{}}); }
  optimize(){
    this.loading=true; this.error='';
    this.api.optimize(this.sectionId).subscribe({next:v=>{this.rec=v; this.windows=v.windowAnalysis||[]; this.loading=false}, error:e=>{this.error=e.error?.message||'AI optimize failed — is ai-service running on 8000?'; this.loading=false}});
  }
  simulate(){
    this.api.simulate(this.sectionId).subscribe({next:v=>{this.windows=v.windows||v.windowAnalysis||[]; if(v.compatibility) this.rec=v; }, error:e=>{this.error='simulate failed'}});
  }
  recommend(){
    this.api.recommendations(this.sectionId).subscribe({next:v=>{this.rec=v; this.windows=v.windowAnalysis||[]}, error:e=>{this.error='recommend failed'}});
  }
}
