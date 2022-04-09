import { Test, TestingModule } from '@nestjs/testing';
import { SportsController } from './sports.controller';

describe('SportsController', () => {
  let controller: SportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsController],
    }).compile();

    controller = module.get<SportsController>(SportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
