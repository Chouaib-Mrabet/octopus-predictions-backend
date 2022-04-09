import { Controller, Get } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminService } from './football-admin.service';

@Controller('football-admin')
export class FootballAdminController {
  constructor(private readonly footballAdminService: FootballAdminService) {}

  @Get('scrapeCountries')
  async scrapeCountries(): Promise<Country[]> {
    let countriesNames: string[] =
      await this.footballAdminService.scrapeCountries();

    let countries = [];
    for (let i = 0; i < countriesNames.length; i++) {
      countries.push(
        await this.footballAdminService.saveCountry(countriesNames[i]),
      );
    }
    return countries;
  }

  @Get('scrapeLeagues')
  async scrapeLeagues(): Promise<any> {

    let countries=await this.footballAdminService.getCountries();
    let leagues = [];

    for(let i=0;i<countries.length;i++){
      let countryLeaguesNames=await this.footballAdminService.scrapeLeagues(countries[i]);
      console.log(countryLeaguesNames)
      for (let j = 0; j < countryLeaguesNames.length; j++) {
        leagues.push(
          await this.footballAdminService.saveLeague(
            countryLeaguesNames[j],
            countries[i],
            
          ),
        );
      }

    }

      

    

    return leagues;
  }
}
