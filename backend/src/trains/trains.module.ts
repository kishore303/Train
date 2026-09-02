import { Module } from '@nestjs/common';
import { TrainsService } from './trains.service.js';
import { TrainsController } from './trains.controller.js';
@Module({ controllers:[TrainsController], providers:[TrainsService] })
export class TrainsModule {}
