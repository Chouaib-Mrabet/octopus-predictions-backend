import { Test, TestingModule } from '@nestjs/testing';
import { SportsAdminController } from './sports-admin.controller';

describe('SportsAdminController', () => {
  let controller: SportsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsAdminController],
    }).compile();

    controller = module.get<SportsAdminController>(SportsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
