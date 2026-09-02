import { Global, Module } from '@nestjs/common';
import { DataRepository } from './data.repository.js';
import { LocalJsonRepository } from './local-json.repository.js';
@Global()
@Module({
  providers: [{ provide: DataRepository, useClass: LocalJsonRepository }],
  exports: [DataRepository],
})
export class DataModule {}
