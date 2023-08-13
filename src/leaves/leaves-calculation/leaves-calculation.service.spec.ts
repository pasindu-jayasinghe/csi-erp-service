import { Test, TestingModule } from '@nestjs/testing';
import { LeavesCalculationService } from './leaves-calculation.service';

describe('LeavesCalculationService', () => {
  let service: LeavesCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeavesCalculationService],
    }).compile();

    service = module.get<LeavesCalculationService>(LeavesCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
