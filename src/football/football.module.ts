import { Module } from '@nestjs/common';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';

@Module({
  controllers: [FootballController],
  providers: [FootballService]
})
export class FootballModule {}
