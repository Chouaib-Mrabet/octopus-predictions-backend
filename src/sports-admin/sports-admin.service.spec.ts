import { Test, TestingModule } from '@nestjs/testing';
import { SportsAdminService } from './sports-admin.service';

describe('SportsAdminService', () => {
  let service: SportsAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsAdminService],
    }).compile();

    service = module.get<SportsAdminService>(SportsAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
