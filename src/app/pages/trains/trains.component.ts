import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../data/data.service';
import { ApiService } from '../../core/api.service';
@Component({
  selector:'app-trains',
  standalone:true,
  imports:[CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Trains <span class="text-xs font-normal" [class.text-emerald-600]="apiMode" [class.text-slate-400]="!apiMode">{{apiMode?'• via /api/trains':'• local fallback'}}</span></h2>
  <p class="text-sm text-slate-500 mb-4">{{list.length}} trains</p>
  <mat-card class="p-3 !bg-white mb-4"><mat-form-field appearance="outline" class="w-full"><mat-label>Search</mat-label><input matInput [(ngModel)]="q"></mat-form-field></mat-card>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    <mat-card *ngFor="let t of filtered()" class="p-4 !bg-white hover:shadow-md">
      <div class="flex justify-between"><span class="font-bold text-blue-700">{{t.number}}</span><span class="text-xs px-2 py-1 rounded" [ngClass]="{'bg-red-100 text-red-700':t.type==='Freight','bg-blue-100 text-blue-700':t.type==='Express'}">{{t.type}}</span></div>
      <div class="font-medium text-sm">{{t.name}}</div>
      <div class="text-xs text-slate-500">{{t.origin}} → {{t.destination}} • {{t.sectionName}}</div>
      <div class="flex gap-4 text-xs mt-2"><span>⏱ {{t.departure}} - {{t.arrival}}</span><span>📅 {{t.frequency}}</span></div>
      <div class="flex justify-between mt-2 text-xs"><span>Speed {{t.avgSpeed}} km/h</span><span [ngClass]="t.conflicts>0?'text-orange-600 font-bold':'text-emerald-600'">{{t.conflicts}} conflicts</span></div>
    </mat-card>
  </div>
  `,
})
export class TrainsComponent implements OnInit{
  q=''; list:any[]=[]; apiMode=false; constructor(public ds:DataService, private api:ApiService){}
  ngOnInit(){ this.list=this.ds.trains; this.api.getTrains().subscribe({next:v=>{this.list=v; this.apiMode=true}, error:()=>{}}); }
  filtered(){ return this.list.filter(t=> !this.q || (t.number+t.name+t.sectionName).toLowerCase().includes(this.q.toLowerCase())); }
}
