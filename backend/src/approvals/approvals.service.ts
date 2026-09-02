import { Injectable } from '@nestjs/common';
import { DataRepository } from '../data/data.repository.js';
@Injectable()
export class ApprovalsService {
  constructor(private repo: DataRepository){}
  list(){
    const pendingTasks=this.repo.getMaintenanceTasks().filter(t=> t.status==='Waiting Approval');
    const plannedBlocks=this.repo.getBlocks().filter(b=> b.status==='Planned');
    return { pendingTasks, plannedBlocks, total: pendingTasks.length+plannedBlocks.length };
  }
}
