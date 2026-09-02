import { Module } from '@nestjs/common';
import { S101Service } from './s101.service.js';
import { DemoController } from './demo.controller.js';
@Module({ controllers:[DemoController], providers:[S101Service] })
export class DemoModule {}
