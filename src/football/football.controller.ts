import { Team } from './../schemas/team.schema';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';

@Controller('football')
@ApiTags('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  // List of All countries :
  @Get('countries')
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
  }

  // List of All leagues :
  @Get('leagues')
  async getAllLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getAllLeagues();

    return leagues;
  }

  // List of Countries with thier leagues :
  @Get('countriesleagues')
  async getLeaguesByCountries(): Promise<League[]> {
    let LeaguesByCountries = await this.footballService.getLeaguesByCountries();

    return LeaguesByCountries;
  }

  // Get Leagues by country :
  @Get('/:country/leagues')
  async getLeaguesByCountry(
    @Param('country') countryName: string,
  ): Promise<League[]> {
    let leaguesByCountry = await this.footballService.getLeaguesByCountry(
      countryName,
    );

    return leaguesByCountry;
  }

  // List of Teams per League :
  @Get('/:country/:league')
  async getTeamsByLeague(
    @Param('country') countryName: string,
    @Param('league') leagueName: string,
  ): Promise<Team[]> {
    let teamsByLeague = await this.footballService.getTeamsByLeague(
      countryName,
      leagueName,
    );

    return teamsByLeague;
  }
}
