import { Test, TestingModule } from '@nestjs/testing';
import { ReadingStatusService } from './reading-status.service';

describe('ReadingStatusService', () => {
  let service: ReadingStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadingStatusService],
    }).compile();

    service = module.get<ReadingStatusService>(ReadingStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
