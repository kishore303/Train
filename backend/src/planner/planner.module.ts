import { Module } from '@nestjs/common';
import { PlannerService } from './planner.service.js';
import { PlannerController } from './planner.controller.js';
@Module({ controllers: [PlannerController], providers: [PlannerService] })
export class PlannerModule {}
