import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Team } from './../schemas/team.schema';
import { ApiTags } from '@nestjs/swagger';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';

@Controller('football')
@ApiTags('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  // List of All leagues :
  @Get('leagues')
  async getLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getLeagues();
    return leagues;
  }

  // Get League by id :
  @Get('league/:id')
  async getLeague(@Param('id') id: string): Promise<League[]> {
    let leagues = await this.footballService.getLeagueById(id);
    return leagues;
  }

  // List of All teams :
  @Get('teams')
  async getTeams(): Promise<Team[]> {
    let teams = await this.footballService.getTeams();
    return teams;
  }

  // Get Team by id :
  @Get('team/:id')
  async getTeam(@Param('id') id: string): Promise<Team> {
    let team = await this.footballService.getTeamById(id);
    return team;
  }

  // List of All countries :
  @Get('countries')
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
  }

  // Get Country by id :
  @Get('country/:id')
  async getCountryById(@Param('id') id: string): Promise<Country> {
    return this.footballService.getCountryById(id);
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

  // Get Logo by id :
  @Get('getLogo/:id')
  @Header('content-type', 'image/png')
  async getLogo(@Res() res, @Param('id') id: string) {
    let logo = await this.footballService.getLogo(id);
    res.send(logo.data);
  }
  
  @Get('getFlag/:id')
  @Header('content-type', 'image/png')
  async getFlag(@Res() res, @Param('id') id: string) {
    let logo = await this.footballService.getFlag(id);
    res.send(logo.data);
  }

  // List of Teams per country :
  @Get('/:country/teams')
  async getTeamsByCountry(
    @Param('country') countryName: string,
  ): Promise<Team[]> {
    let teamsByLeague = await this.footballService.getTeamsByCountry(
      countryName,
    );

    return teamsByLeague;
  }

  // Games :
  // List of games per league :
  // TODO : Add Filters && Pagination
  @Get('/:country/:league/games')
  async getGamesByLeague(
    @Param('country') countryName: string,
    @Param('league') leagueName: string,
  ): Promise<Team[]> {
    let gamesByLeague = await this.footballService.getGamesByLeague(
      countryName,
      leagueName,
    );

    return gamesByLeague;
  }


}
