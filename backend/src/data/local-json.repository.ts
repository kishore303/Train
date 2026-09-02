import { Injectable } from '@nestjs/common';
import { DataRepository } from './data.repository.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LocalJsonRepository extends DataRepository {
  private dir = join(process.cwd(), 'data');
  private altDir = join(process.cwd(), 'backend', 'data');
  private cache = new Map<string, any>();

  private load(name: string): any[] {
    if (this.cache.has(name)) return this.cache.get(name);
    let p = join(this.dir, name);
    if (!existsSync(p)) p = join(this.altDir, name);
    if (!existsSync(p)) p = join(process.cwd(), '..', 'data', name);
    // fallback: try absolute
    if (!existsSync(p)) {
      // last attempt: backend/data relative to project root D:\train
      p = join('D:/train/backend/data', name);
    }
    try {
      const data = JSON.parse(readFileSync(p, 'utf-8'));
      this.cache.set(name, data);
      return data;
    } catch {
      return [];
    }
  }
  private save(name: string, data: any[]) {
    this.cache.set(name, data);
    let p = join(this.dir, name);
    if (!existsSync(this.dir)) p = join(this.altDir, name);
    try { writeFileSync(p, JSON.stringify(data, null, 2)); } catch {}
  }

  getMaintenanceTasks(): any[] { return this.load('maintenance_tasks.json'); }
  saveMaintenanceTasks(t: any[]) { this.save('maintenance_tasks.json', t); }
  getTrains(): any[] { return this.load('trains.json'); }
  getSections(): any[] { return this.load('railway_sections.json'); }
  getAssets(): any[] { return this.load('assets.json'); }
  getBlocks(): any[] { return this.load('existing_blocks.json'); }
  saveBlocks(b: any[]) { this.save('existing_blocks.json', b); }
  getEvents(): any[] {
    return [
      { id: 'EVT001', title: 'Block BLK003 activated', time: 'Today 02:00', desc: 'Engineering block on NDLS-AGC started. 2 trains rescheduled.', level: 'INFO', type: 'block' },
      { id: 'EVT002', title: 'High priority task flagged', time: 'Today 08:30', desc: 'MNT007 Track Renewal at BCT-ST marked Critical', level: 'CRITICAL', type: 'maintenance' },
      { id: 'EVT003', title: 'Train conflict detected', time: 'Today 09:15', desc: '12019 Shatabdi vs Freight overlap on AGC-BPL', level: 'WARN', type: 'conflict' },
      { id: 'EVT004', title: 'Asset availability improved', time: 'Yesterday 18:00', desc: 'Signal AST022 restored 94%→98%', level: 'INFO', type: 'asset' },
      { id: 'EVT005', title: 'Recommended block generated', time: 'Yesterday 10:00', desc: 'AI suggests BLK014 on NDLS-UMB 02:00-06:00', level: 'AI', type: 'block' },
    ];
  }
}
