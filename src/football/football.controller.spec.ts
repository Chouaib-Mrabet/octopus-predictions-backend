import { Test, TestingModule } from '@nestjs/testing';
import { FootballController } from './football.controller';

describe('FootballController', () => {
  let controller: FootballController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FootballController],
    }).compile();

    controller = module.get<FootballController>(FootballController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
