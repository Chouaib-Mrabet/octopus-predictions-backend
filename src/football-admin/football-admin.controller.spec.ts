import { Test, TestingModule } from '@nestjs/testing';
import { FootballAdminController } from './football-admin.controller';

describe('FootballAdminController', () => {
  let controller: FootballAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FootballAdminController],
    }).compile();

    controller = module.get<FootballAdminController>(FootballAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
