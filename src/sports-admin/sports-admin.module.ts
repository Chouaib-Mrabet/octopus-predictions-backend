import { Module } from '@nestjs/common';
import { SportsAdminController } from './sports-admin.controller';
import { SportsAdminService } from './sports-admin.service';

@Module({
  controllers: [SportsAdminController],
  providers: [SportsAdminService]
})
export class SportsAdminModule {}
