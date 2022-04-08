import { Test, TestingModule } from '@nestjs/testing';
import { FootballAdminService } from './football-admin.service';

describe('FootballAdminService', () => {
  let service: FootballAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FootballAdminService],
    }).compile();

    service = module.get<FootballAdminService>(FootballAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
