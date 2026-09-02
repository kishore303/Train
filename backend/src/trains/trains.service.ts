import { Injectable } from '@nestjs/common';
import { DataRepository } from '../data/data.repository.js';
@Injectable()
export class TrainsService {
  constructor(private repo: DataRepository){}
  list(){ return this.repo.getTrains(); }
  get(id: string){ return this.repo.getTrains().find(t=> t.id===id || t.number===id); }
}
