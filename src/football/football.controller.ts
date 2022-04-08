import { Controller, Get } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballService } from './football.service';

@Controller('football')
export class FootballController {
    constructor(private readonly footballService: FootballService) {}

  @Get('countries')
  async scrapeCountries(): Promise<Country[]> {
      return this.footballService.getCountries();
  }
}
