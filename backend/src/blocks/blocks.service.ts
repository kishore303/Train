import { Injectable } from '@nestjs/common';
import { DataRepository } from '../data/data.repository.js';
@Injectable()
export class BlocksService {
  constructor(private repo: DataRepository){}
  list(){ return this.repo.getBlocks(); }
  get(id:string){ return this.repo.getBlocks().find(b=> b.id===id); }
  create(dto:any){
    const blocks=this.repo.getBlocks();
    const id='BLK'+String(blocks.length+1).padStart(3,'0');
    // Mandatory human approval: never auto-approve — new blocks always Planned
    const nb={ id, status:'Planned', recommended: false, conflicts:0, ...dto };
    if(nb.status==='Active') nb.status='Planned';
    blocks.push(nb);
    this.repo.saveBlocks(blocks);
    return nb;
  }
}
