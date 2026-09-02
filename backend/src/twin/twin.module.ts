import { Module } from '@nestjs/common';
import { TwinService } from './twin.service.js';
import { TwinController } from './twin.controller.js';
@Module({ controllers:[TwinController], providers:[TwinService] })
export class TwinModule {}
