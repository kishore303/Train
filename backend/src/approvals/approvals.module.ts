import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service.js';
import { ApprovalsController } from './approvals.controller.js';
import { WorkflowModule } from '../workflows/workflow.module.js';
@Module({ imports:[WorkflowModule], controllers:[ApprovalsController], providers:[ApprovalsService] })
export class ApprovalsModule {}
