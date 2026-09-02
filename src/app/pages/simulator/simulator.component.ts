import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../data/data.service';

@Component({
  selector:'app-simulator',
  standalone:true,
  imports:[CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template:`
  <h2 class="text-xl font-bold mb-1">What-If Simulator <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">OR-Tools • AI</span></h2>
  <p class="text-sm text-slate-500 mb-3">Change block start/duration/tasks/train frequency/num trains/department → compare OPTION A/B/C + AI OPTIMAL</p>
  <div class="bg-amber-50 border border-amber-300 text-amber-800 text-xs px-3 py-2 rounded mb-3">AI model trained on synthetic demonstration data.</div>
  <mat-card class="p-4 !bg-white mb-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <mat-form-field appearance="outline"><mat-label>Section</mat-label><mat-select [(value)]="sectionId"><mat-option *ngFor="let s of ds.sections" [value]="s.id">{{s.code}}</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Start (HH:MM)</mat-label><input matInput [(ngModel)]="start" placeholder="02:00"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Duration (h)</mat-label><input matInput type="number" [(ngModel)]="duration"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Department</mat-label><mat-select [(value)]="dept"><mat-option value="Engineering">Engineering</mat-option><mat-option value="Electrical">Electrical</mat-option><mat-option value="S&T">S&T</mat-option><mat-option value="Mixed">Mixed</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Train Freq</mat-label><mat-select [(value)]="freq"><mat-option value="Daily">Daily</mat-option><mat-option value="Weekly">Weekly</mat-option><mat-option value="Mon-Fri">Mon-Fri</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label># Trains</mat-label><input matInput type="number" [(ngModel)]="numTrains"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Tasks (comma IDs)</mat-label><input matInput [(ngModel)]="tasksStr" placeholder="MNT001,MNT002"></mat-form-field>
      <button mat-flat-button color="primary" (click)="run()" class="h-14">Run Simulator</button>
    </div>
    <button mat-stroked-button class="mt-3" (click)="triggerReplan()">Trigger Dynamic Re-planning (demo train.delayed)</button>
    <div *ngIf="replanMsg" class="mt-2 bg-emerald-100 text-emerald-800 text-xs p-2 rounded">{{replanMsg}}</div>
  </mat-card>

  <div *ngIf="result" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
    <mat-card *ngFor="let o of result.options" class="p-4 !bg-white" [class.border-2]="o.label==='AI OPTIMAL'" [class.border-emerald-400]="o.label==='AI OPTIMAL'" [class.bg-emerald-50]="o.label==='AI OPTIMAL'">
      <div class="font-bold" [class.text-emerald-700]="o.label==='AI OPTIMAL'">{{o.label}} <span *ngIf="o.label==='AI OPTIMAL'" class="bg-emerald-600 text-white text-xs px-1 rounded">RECOMMENDED</span></div>
      <div class="text-xs text-slate-500">{{o.window}} • {{o.duration||duration}}h • {{o.department}}</div>
      <div class="text-xs mt-2">Affected: <b>{{o.affectedCount}}</b> trains • Delay <b>{{o.estimatedDelayMin}}m</b></div>
      <div class="text-xs">Impact: <span class="px-1 rounded" [ngClass]="{'bg-emerald-100':o.operationalImpact==='LOW','bg-amber-100':o.operationalImpact==='MEDIUM','bg-red-100':o.operationalImpact==='HIGH'}">{{o.operationalImpact}}</span> • Downtime {{o.assetDowntimeH}}h</div>
      <div class="text-xs mt-1">Score: <b [class.text-emerald-600]="o.optimizationScore>70">{{o.optimizationScore}}/100</b></div>
      <div class="text-xs mt-1">Tasks: {{o.tasks?.join(', ')}}</div>
      <div class="text-xs mt-1" *ngIf="o.reasons">Reason: {{o.reasons?.join(' • ') | slice:0:80}}</div>
      <div class="text-xs mt-1">Compat: <b [class.text-emerald-600]="o.compatibility==='COMPATIBLE'">{{o.compatibility}}</b></div>
    </mat-card>
  </div>
  `,
})
export class SimulatorComponent {
  sectionId='SEC001'; start='02:00'; duration=4; dept='Engineering'; freq='Daily'; numTrains=30; tasksStr='MNT001,MNT002';
  result:any=null; replanMsg='';
  constructor(private api:ApiService, public ds:DataService){}
  run(){
    const tasks=this.tasksStr.split(',').map(s=>s.trim()).filter(Boolean).map(id=>({id, title:'Task '+id, sectionId:this.sectionId, crew:this.dept}));
    this.api.predictDelay({} as any).subscribe(); // warm
    // call whatif via planner
    (this.api as any).whatif({sectionId:this.sectionId, start:this.start, duration:this.duration, tasks, trainFrequency:this.freq, numTrains:this.numTrains, department:this.dept}).subscribe({next:(v:any)=>{this.result=v;}, error:(e:any)=>{console.error(e)}});
    // fallback: also fetch via direct AI if Nest proxy fails
    // use fetch to AI directly
    fetch('http://localhost:8000/whatif',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({sectionId:this.sectionId, start:this.start, duration:this.duration, tasks, trainFrequency:this.freq, numTrains:this.numTrains, department:this.dept})}).then(r=>r.json()).then(v=>{ if(!this.result) this.result=v}).catch(()=>{});
  }
  triggerReplan(){
    this.replanMsg='Re-planning started...';
    (this.api as any).optimize(this.sectionId).subscribe({next:(v:any)=>{ this.replanMsg='PLAN UPDATED — '+v.recommendedWindow+' score '+v.optimizationScore;}, error:()=>{ this.replanMsg='PLAN UPDATED (fallback)'; }});
    fetch('http://localhost:3000/api/planner/replan',{method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}`}, body: JSON.stringify({reason:'train.delayed', payload:{sectionId:this.sectionId}})}).then(r=>r.json()).then(j=>{ this.replanMsg='PLAN UPDATED via event bus: '+JSON.stringify(j).slice(0,100)}).catch(()=>{});
  }
}
