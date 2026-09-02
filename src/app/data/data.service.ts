import { Injectable } from '@angular/core';
import tasks from './maintenance_tasks.json';
import trains from './trains.json';
import sections from './railway_sections.json';
import assets from './assets.json';
import blocks from './existing_blocks.json';

@Injectable({providedIn:'root'})
export class DataService {
  tasks = (tasks as any[]);
  trains = (trains as any[]);
  sections = (sections as any[]);
  assets = (assets as any[]);
  blocks = (blocks as any[]);

  get pendingTasks(){ return this.tasks.filter(t=>t.status==='Pending').length; }
  get highPriority(){ return this.tasks.filter(t=>t.priority==='Critical'||t.priority==='High').length; }
  get activeBlocks(){ return this.blocks.filter(b=>b.status==='Active').length; }
  get recommendedBlocks(){ return this.blocks.filter(b=>b.recommended).length; }
  get trainConflicts(){ return this.trains.reduce((s,t)=>s+(t.conflicts||0),0); }
  get avgAvailability(){ return Math.round(this.assets.reduce((s,a)=>s+a.availability,0)/this.assets.length); }
}
