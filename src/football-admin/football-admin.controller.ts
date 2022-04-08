import { Controller, Get } from '@nestjs/common';
import { FootballAdminService } from './football-admin.service';

@Controller('football-admin')
export class FootballAdminController {
  constructor(private readonly footballAdminService: FootballAdminService) {}

  @Get('scrapeCountries')
  async scrapeCountries(): Promise<string[]> {
    let countriesNames: string[] =
      await this.footballAdminService.scrapeCountries();

    let countries=[];
    for (let i = 0; i < countriesNames.length; i++) {
        
      countries.push( await this.footballAdminService.saveCountry(countriesNames[i]));
    }
    return countries;
  }
}
