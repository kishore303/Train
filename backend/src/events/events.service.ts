import { Injectable } from '@nestjs/common';
import { DataRepository } from '../data/data.repository.js';
@Injectable()
export class EventsService {
  constructor(private repo: DataRepository){}
  list(){ return this.repo.getEvents(); }
}
