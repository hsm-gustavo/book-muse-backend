import { Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { EnvModule } from 'src/env/env.module';

@Module({
  imports: [EnvModule],
  providers: [R2Service],
  exports: [R2Service],
})
export class StorageModule {}
