import { Test, TestingModule } from '@nestjs/testing';
import { FootballService } from './football.service';

describe('FootballService', () => {
  let service: FootballService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FootballService],
    }).compile();

    service = module.get<FootballService>(FootballService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
