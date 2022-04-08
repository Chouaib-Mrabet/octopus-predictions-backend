import { Module } from '@nestjs/common';
import { FootballAdminController } from './football-admin.controller';
import { FootballAdminService } from './football-admin.service';

@Module({
  controllers: [FootballAdminController],
  providers: [FootballAdminService]
})
export class FootballAdminModule {}
