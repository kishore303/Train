import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector:'app-twin',
  standalone:true,
  imports:[CommonModule, MatCardModule, MatButtonModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Digital Twin <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Python + NetworkX</span></h2>
  <p class="text-sm text-slate-500 mb-3">Stations → Nodes, Junctions → Nodes, Sections → Edges • Assets: TRACK/OHE/SIGNAL/POINT/AXLE_COUNTER/TELECOM • States: AVAILABLE/BLOCKED/UNDER_MAINTENANCE/DEGRADED</p>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    <mat-card class="p-4 !bg-white">
      <div class="font-semibold mb-2">Graph</div>
      <div class="text-xs">Nodes: {{graph.nodes?.length}} • Edges: {{graph.edges?.length}}</div>
      <div class="text-xs">Stations: {{graph.stats?.stations}} • Sections: {{graph.stats?.sections}}</div>
      <div class="mt-2 max-h-64 overflow-auto text-xs">
        <div *ngFor="let n of graph.nodes | slice:0:10">{{$any(n).id}} ({{$any(n).type}}) — {{$any(n).zone}}</div>
        <div *ngFor="let e of graph.edges | slice:0:5" class="text-slate-500">{{$any(e).source}} → {{$any(e).target}} [{{$any(e).sectionId}}]</div>
      </div>
    </mat-card>
    <mat-card class="p-4 !bg-white">
      <div class="font-semibold mb-2">Twin Metrics</div>
      <div class="text-xs">Total Assets: {{metrics.totalAssets}}</div>
      <div class="flex gap-2 mt-2">
        <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">AVAILABLE {{metrics.byState?.AVAILABLE||0}}</span>
        <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">BLOCKED {{metrics.byState?.BLOCKED||0}}</span>
        <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">UNDER_MAINTENANCE {{metrics.byState?.UNDER_MAINTENANCE||0}}</span>
        <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">DEGRADED {{metrics.byState?.DEGRADED||0}}</span>
      </div>
      <div class="mt-3">
        <button mat-flat-button color="primary" class="!text-xs" (click)="startBlock()">Simulate Block Start (AVAILABLE→BLOCKED)</button>
        <button mat-stroked-button class="!text-xs ml-2" (click)="completeBlock()">Complete (→AVAILABLE)</button>
      </div>
      <div *ngIf="lastTrans" class="text-xs mt-2 bg-slate-50 p-2 rounded">{{lastTrans | json}}</div>
      <div class="text-xs mt-2">Lifecycle: AVAILABLE → BLOCKED → UNDER_MAINTENANCE → AVAILABLE</div>
    </mat-card>
  </div>
  <mat-card class="p-4 !bg-white">
    <div class="font-semibold mb-2">Assets (sample)</div>
    <table class="w-full text-xs">
      <tr class="bg-slate-50"><th class="text-left p-2">Asset</th><th>Type</th><th>Section</th><th>State</th><th>History</th></tr>
      <tr *ngFor="let a of assets | slice:0:8" class="border-t">
        <td class="p-2 font-mono">{{a.id}}</td><td>{{a.type}}</td><td>{{a.sectionId}}</td>
        <td><span class="px-2 py-1 rounded text-xs" [ngClass]="{'bg-emerald-100 text-emerald-700':a.twinState==='AVAILABLE','bg-amber-100':a.twinState==='BLOCKED','bg-orange-100':a.twinState==='UNDER_MAINTENANCE'}">{{a.twinState}}</span></td>
        <td class="text-slate-500">{{a.history?.slice(-2).join(' → ')}}</td>
      </tr>
    </table>
  </mat-card>
  `,
})
export class TwinComponent implements OnInit{
  graph:any={}; assets:any[]=[]; metrics:any={}; lastTrans:any=null;
  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.http.get<any>('http://localhost:8000/twin/graph').subscribe(v=>this.graph=v);
    this.http.get<any>('http://localhost:8000/twin/assets').subscribe(v=>{this.assets=v.assets; this.metrics=v.metrics});
  }
  startBlock(){
    this.http.post<any>('http://localhost:8000/twin/block/start', {sectionId:'SEC001'}).subscribe(v=>{this.lastTrans=v; this.load();});
    // also via Nest
    this.http.post('http://localhost:3000/api/twin/block/start', {sectionId:'SEC001'}).subscribe(()=>{ this.load();});
  }
  completeBlock(){
    this.http.post<any>('http://localhost:8000/twin/block/complete', {sectionId:'SEC001'}).subscribe(v=>{this.lastTrans=v; this.load();});
    this.http.post('http://localhost:3000/api/twin/block/complete', {sectionId:'SEC001'}).subscribe(()=>{});
  }
}
