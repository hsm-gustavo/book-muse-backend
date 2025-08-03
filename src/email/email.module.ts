import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EnvModule } from 'src/env/env.module';

@Module({
  providers: [EmailService],
  exports: [EmailService],
  imports: [EnvModule],
})
export class EmailModule {}
