import { Injectable } from '@nestjs/common';
import { DataRepository } from '../data/data.repository.js';
import { computeRisk } from './risk.engine.js';

@Injectable()
export class MaintenanceService {
  constructor(private repo: DataRepository) {}
  list() {
    const assets = this.repo.getAssets();
    return this.repo.getMaintenanceTasks().map(t => {
      const r = computeRisk(t, assets);
      return { ...t, riskScore: r.score, computedPriority: r.priority };
    });
  }
  get(id: string) {
    const t = this.repo.getMaintenanceTasks().find(x => x.id === id);
    if (!t) return null;
    const r = computeRisk(t, this.repo.getAssets());
    return { ...t, riskScore: r.score, computedPriority: r.priority };
  }
  create(dto: any) {
    const tasks = this.repo.getMaintenanceTasks();
    const id = 'MNT' + String(tasks.length + 1).padStart(3, '0');
    const nt = { id, status: 'Pending', priority: dto.priority || 'Medium', ...dto };
    tasks.push(nt);
    this.repo.saveMaintenanceTasks(tasks);
    return nt;
  }
  update(id: string, dto: any) {
    const tasks = this.repo.getMaintenanceTasks();
    const idx = tasks.findIndex(x => x.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...dto };
    this.repo.saveMaintenanceTasks(tasks);
    return tasks[idx];
  }
}
