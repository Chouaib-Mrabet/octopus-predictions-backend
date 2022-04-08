import { Controller, Get } from '@nestjs/common';
import { Sport } from 'src/schemas/sport.schema';
import { SportsService } from './sports.service';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  getSports(): Promise<Sport[]> {
    return this.sportsService.getSports();
  }
}
