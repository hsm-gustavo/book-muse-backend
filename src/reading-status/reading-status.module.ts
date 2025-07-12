import { Module } from '@nestjs/common';
import { ReadingStatusService } from './reading-status.service';
import { ReadingStatusController } from './reading-status.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ReadingStatusController],
  providers: [ReadingStatusService, PrismaService],
})
export class ReadingStatusModule {}
