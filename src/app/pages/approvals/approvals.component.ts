import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';
@Component({
  selector:'app-approvals',
  standalone:true,
  imports:[CommonModule, MatCardModule, MatButtonModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Approvals <span class="text-xs font-normal" [class.text-emerald-600]="apiMode" [class.text-slate-400]="!apiMode">{{apiMode?'• via /api/approvals':'• local'}}</span></h2>
  <div class="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-3">Workflow: Maintenance Request → Verification → Department Review → Operating Review → AI Recommendation → <b>Authorized Human Approval</b> → Scheduled Block → Maintenance → Completion → Block Release — <b>AI NEVER auto-approves</b></div>
  <div class="flex flex-wrap gap-1 text-xs mb-3">
    <span class="px-2 py-1 bg-slate-200 rounded">REQUESTED</span><span>→</span><span class="px-2 py-1 bg-blue-100 rounded">VERIFICATION</span><span>→</span><span class="px-2 py-1 bg-indigo-100 rounded">DEPT REVIEW</span><span>→</span><span class="px-2 py-1 bg-purple-100 rounded">OPERATING REVIEW</span><span>→</span><span class="px-2 py-1 bg-amber-100 rounded">AI RECOMMENDED</span><span>→</span><span class="px-2 py-1 bg-emerald-600 text-white rounded">AWAITING HUMAN APPROVAL</span><span>→</span><span class="px-2 py-1 bg-emerald-100 rounded">SCHEDULED</span>
  </div>
  <p class="text-sm text-slate-500 mb-2">Temporal workflows: MaintenanceApprovalWorkflow, BlockPlanningWorkflow, BlockExecutionWorkflow — fallback local state-machine if Temporal unavailable (DEMO_MODE)</p>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <mat-card *ngFor="let t of pendingTasks" class="p-4 !bg-white border-l-4 border-amber-500">
      <div class="flex justify-between"><span class="font-mono text-xs">{{t.id}}</span><span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{{t.status}}</span></div>
      <div class="font-semibold text-sm mt-1">{{t.title}} <span *ngIf="t.riskScore" class="text-xs bg-slate-100 px-1 rounded">Risk {{t.riskScore}}</span></div>
      <div class="text-xs text-slate-500">{{t.sectionName}} • {{t.durationHrs}}h • {{t.priority}}</div>
      <div class="flex gap-2 mt-3"><button mat-flat-button color="primary" class="!text-xs" (click)="approve(t.id)">Approve (Human {{userRole}})</button><button mat-stroked-button class="!text-xs" (click)="reject(t.id)">Reject</button></div>
      <div *ngIf="msg[t.id]" class="text-xs mt-2" [class.text-emerald-600]="msg[t.id].includes('SCHEDULED')" [class.text-red-600]="msg[t.id].includes('Failed')">{{msg[t.id]}}</div>
    </mat-card>
  </div>
  <mat-card class="p-4 !bg-white mt-4">
    <div class="font-semibold mb-2">Planned Blocks Awaiting Approval ({{plannedBlocks.length}})</div>
    <table class="w-full text-sm">
      <thead class="text-slate-500 bg-slate-50"><tr><th class="text-left p-2">Block</th><th>Section</th><th>Window</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr *ngFor="let b of plannedBlocks" class="border-t"><td class="p-2 font-mono text-xs">{{b.id}}</td><td class="text-xs">{{b.sectionName}}</td><td class="text-xs">{{b.start | date:'shortDate'}}</td><td class="text-xs"><span class="bg-amber-100 px-2 py-1 rounded">{{b.status}}</span></td><td><button mat-stroked-button class="!text-xs" (click)="approve(b.id)">Approve</button></td></tr>
      </tbody>
    </table>
    <div class="text-xs text-slate-500 mt-2">POST /api/approvals/:id/approve requires ADMIN/ENGINEERING_OFFICER/OPERATING_OFFICER — AI auto-approval blocked.</div>
  </mat-card>
  `,
})
export class ApprovalsComponent implements OnInit{
  pendingTasks:any[]=[]; plannedBlocks:any[]=[]; apiMode=false; msg:any={}; userRole='';
  constructor(public ds:DataService, private api:ApiService){}
  ngOnInit(){
    try{ this.userRole=JSON.parse(localStorage.getItem('user')||'{}').role||''; }catch{}
    this.pendingTasks=this.ds.tasks.filter(t=> t.status==='Waiting Approval').slice(0,6);
    this.plannedBlocks=this.ds.blocks.filter(b=> b.status==='Planned');
    this.api.getApprovals().subscribe({next:(v:any)=>{this.pendingTasks=v.pendingTasks; this.plannedBlocks=v.plannedBlocks; this.apiMode=true}, error:()=>{}});
  }
  approve(id:string){
    this.msg[id]='Approving...';
    fetch(`http://localhost:3000/api/approvals/${id}/approve`,{method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}`}, body:JSON.stringify({})}).then(r=>r.json().then(j=>{ this.msg[id]= r.ok ? `SCHEDULED — ${j.message||'human approved'}` : `Failed ${j.message||r.status}`; if(r.ok) setTimeout(()=>this.ngOnInit(),800); })).catch(()=>this.msg[id]='Failed — backend unreachable');
  }
  reject(id:string){
    fetch(`http://localhost:3000/api/approvals/${id}/reject`,{method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}`}, body:JSON.stringify({})}).then(()=>this.msg[id]='REJECTED').catch(()=>{});
  }
}
