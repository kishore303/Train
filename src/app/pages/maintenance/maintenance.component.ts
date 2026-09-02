import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector:'app-maintenance',
  standalone:true,
  imports:[CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Maintenance Tasks <span class="text-xs font-normal" [class.text-emerald-600]="apiMode" [class.text-slate-400]="!apiMode">{{apiMode?'• via /api/maintenance':'• local fallback'}}</span></h2>
  <p class="text-sm text-slate-500 mb-2">{{list.length}} tasks • Risk engine: 0-100 • Priority: CRITICAL 80-100, HIGH 60-79, MEDIUM 40-59, LOW 0-39</p>
  <mat-card class="p-4 !bg-white mb-4">
    <div class="flex gap-4 flex-wrap">
      <mat-form-field appearance="outline" class="flex-1 min-w-[200px]"><mat-label>Search</mat-label><input matInput [(ngModel)]="q" placeholder="Track, OHE..."></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Priority</mat-label><mat-select [(value)]="pri"><mat-option value="">All</mat-option><mat-option value="Critical">Critical</mat-option><mat-option value="High">High</mat-option><mat-option value="Medium">Medium</mat-option><mat-option value="Low">Low</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select [(value)]="st"><mat-option value="">All</mat-option><mat-option value="Pending">Pending</mat-option><mat-option value="Scheduled">Scheduled</mat-option><mat-option value="In Progress">In Progress</mat-option><mat-option value="Waiting Approval">Waiting Approval</mat-option></mat-select></mat-form-field>
    </div>
  </mat-card>
  <mat-card class="!bg-white overflow-auto">
    <table class="w-full text-sm">
      <thead class="bg-slate-50 text-slate-500"><tr><th class="text-left p-3">ID</th><th class="text-left">Title</th><th>Section</th><th>Priority</th><th>Risk</th><th>Status</th><th>Duration</th></tr></thead>
      <tbody>
        <tr *ngFor="let t of filtered()" class="border-t hover:bg-slate-50">
          <td class="p-3 font-mono text-xs">{{t.id}}</td><td class="font-medium">{{t.title}}</td><td class="text-xs">{{t.sectionName}}</td>
          <td><span class="px-2 py-1 rounded text-xs font-medium" [ngClass]="{'bg-red-100 text-red-700':t.priority==='Critical','bg-orange-100 text-orange-700':t.priority==='High','bg-blue-100 text-blue-700':t.priority==='Medium'}">{{t.priority}}</span></td>
          <td><span class="px-2 py-1 rounded text-xs font-bold" [ngClass]="{'bg-red-600 text-white':t.riskScore>=80,'bg-orange-500 text-white':t.riskScore>=60 && t.riskScore<80,'bg-blue-100 text-blue-700':t.riskScore>=40 && t.riskScore<60,'bg-slate-100':t.riskScore<40}">{{t.riskScore ?? '-'}} {{t.computedPriority||''}}</span></td>
          <td><span class="text-xs px-2 py-1 rounded bg-slate-100">{{t.status}}</span></td><td class="text-center">{{t.durationHrs}}h</td>
        </tr>
      </tbody>
    </table>
  </mat-card>
  `,
})
export class MaintenanceComponent implements OnInit {
  q=''; pri=''; st=''; list:any[]=[]; apiMode=false;
  constructor(public ds:DataService, private api:ApiService){}
  ngOnInit(){ this.list=this.ds.tasks; this.api.getMaintenance().subscribe({next:v=>{this.list=v; this.apiMode=true}, error:()=>{}}); }
  filtered(){ return this.list.filter(t=> (!this.q || t.title.toLowerCase().includes(this.q.toLowerCase()) || t.id.toLowerCase().includes(this.q.toLowerCase())) && (!this.pri || t.priority===this.pri) && (!this.st || t.status===this.st)); }
}
