import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataModule } from './data/data.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MaintenanceModule } from './maintenance/maintenance.module.js';
import { TrainsModule } from './trains/trains.module.js';
import { BlocksModule } from './blocks/blocks.module.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { EventsModule } from './events/events.module.js';
import { PlannerModule } from './planner/planner.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { TwinModule } from './twin/twin.module.js';
import { WorkflowModule } from './workflows/workflow.module.js';
import { DemoModule } from './demo/demo.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [DataModule, AuthModule, MaintenanceModule, TrainsModule, BlocksModule, ApprovalsModule, AnalyticsModule, EventsModule, PlannerModule, RealtimeModule, TwinModule, WorkflowModule, DemoModule, MonitoringModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
