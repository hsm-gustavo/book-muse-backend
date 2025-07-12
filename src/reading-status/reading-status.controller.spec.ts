import { Test, TestingModule } from '@nestjs/testing';
import { ReadingStatusController } from './reading-status.controller';
import { ReadingStatusService } from './reading-status.service';

describe('ReadingStatusController', () => {
  let controller: ReadingStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingStatusController],
      providers: [ReadingStatusService],
    }).compile();

    controller = module.get<ReadingStatusController>(ReadingStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
