import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service.js';
import { BlocksController } from './blocks.controller.js';
@Module({ controllers:[BlocksController], providers:[BlocksService] })
export class BlocksModule {}
