import { Controller, Get, Header, Param, Res, UseGuards } from '@nestjs/common';
import { Team } from './../schemas/team.schema';
import { ApiTags } from '@nestjs/swagger';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';
import { Game } from 'src/schemas/game.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Userd } from 'src/decorators/userd.decorator';

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

  // List of All teams :
  @Get('teams')
  async getTeams(): Promise<Team[]> {
    let teams = await this.footballService.getTeams();
    return teams;
  }

  // List of All countries :
  @Get('countries')
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
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
