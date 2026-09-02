import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../../data/data.service';
import * as L from 'leaflet';
@Component({
  selector:'app-map',
  standalone:true,
  imports:[CommonModule, MatCardModule],
  template:`
  <h2 class="text-xl font-bold mb-1">Railway Network Map</h2>
  <p class="text-sm text-slate-500 mb-4">Leaflet map with synthetic coordinates — {{ds.sections.length}} sections, {{ds.blocks.length}} blocks</p>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <mat-card class="p-3 !bg-white lg:col-span-1">
      <div class="font-semibold text-sm mb-2">Sections</div>
      <div *ngFor="let s of ds.sections" class="text-xs py-1 border-b flex justify-between"><span>{{s.code}}</span><span class="text-slate-500">{{s.zone}} • {{s.trafficDensity}}</span></div>
      <div class="font-semibold text-sm mt-3 mb-2">Legend</div>
      <div class="text-xs space-y-1"><div><span class="inline-block w-3 h-3 bg-blue-600 rounded-full"></span> Section hub</div><div><span class="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Active block</div><div><span class="inline-block w-3 h-3 bg-emerald-500 rounded-full"></span> Recommended</div></div>
    </mat-card>
    <mat-card class="p-0 !bg-white lg:col-span-3 overflow-hidden"><div id="map" class="h-[520px] w-full"></div></mat-card>
  </div>
  `,
})
export class MapComponent implements AfterViewInit{
  constructor(public ds:DataService){}
  ngAfterViewInit(){
    const map = L.map('map').setView([22.5, 78.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
    this.ds.sections.forEach(s=>{
      L.circleMarker([s.lat,s.lng],{radius:8,color:'#1d4ed8',fillColor:'#3b82f6',fillOpacity:0.9}).addTo(map).bindPopup(`<b>${s.name}</b><br>${s.code} • ${s.zone} • ${s.lengthKm}km<br>Stations: ${s.stations.join(', ')}`);
      // draw line to next random
    });
    this.ds.blocks.forEach(b=>{
      const sec=this.ds.sections.find(x=>x.id===b.sectionId);
      if(!sec) return;
      const lat=sec.lat + (Math.random()-0.5)*1.5;
      const lng=sec.lng + (Math.random()-0.5)*1.5;
      const color=b.status==='Active'?'#ef4444': b.recommended?'#10b981':'#f59e0b';
      L.circleMarker([lat,lng],{radius:6,color,fillColor:color,fillOpacity:0.8}).addTo(map).bindPopup(`<b>${b.id}</b> ${b.sectionName}<br>${b.kmFrom}-${b.kmTo} km<br>${b.status} • ${b.reason}`);
    });
    setTimeout(()=> map.invalidateSize(),300);
  }
}
