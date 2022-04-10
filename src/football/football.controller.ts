import { Controller, Get } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';

@Controller('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('countries')
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
  }
  @Get('leagues')
  async getAllLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getAllLeagues();
    console.log(leagues[0].country.name);
    return leagues;
  }
}
