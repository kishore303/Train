import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service.js';
import { MaintenanceController } from './maintenance.controller.js';
@Module({ controllers:[MaintenanceController], providers:[MaintenanceService] })
export class MaintenanceModule {}
