import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import { Team } from './../schemas/team.schema';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';
import { Game } from 'src/schemas/game.schema';
import { PaginationParams } from 'src/dto/pagination-params';

@Controller('football')
@ApiTags('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  // @Get('testpagination')
  // async testpagination(
  //   @Query() { skip, limit }: PaginationParams,
  // ): Promise<Team[]> {
  //   let teams = await this.footballService.testpagination(skip, limit);
  //   return teams;
  // }

  // List of All leagues :
  @Get('leagues')
  @ApiOperation({ summary: 'Get All Leagues' })
  async getLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getLeagues();
    return leagues;
  }

  // Get League by id :
  @Get('league/:id')
  @ApiOperation({ summary: 'Get League By Id' })
  async getLeague(@Param('id') id: string): Promise<League[]> {
    let leagues = await this.footballService.getLeagueById(id);
    return leagues;
  }

  // List of All teams :
  @Get('teams')
  @ApiOperation({ summary: 'Get All Teams' })
  async getTeams(): Promise<Team[]> {
    let teams = await this.footballService.getTeams();
    return teams;
  }

  // Get Team by id :
  @Get('team/:id')
  @ApiOperation({ summary: 'Get Team by Id' })
  async getTeam(@Param('id') id: string): Promise<Team> {
    let team = await this.footballService.getTeamById(id);
    return team;
  }

  // List of All countries :
  @Get('countries')
  @ApiOperation({ summary: 'Get All Countries' })
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
  }

  // Get Country by id :
  @Get('country/:id')
  @ApiOperation({ summary: 'Get Country by Id' })
  async getCountryById(@Param('id') id: string): Promise<Country> {
    return this.footballService.getCountryById(id);
  }

  // List of Countries with thier leagues :
  @Get('countriesleagues')
  @ApiOperation({ summary: 'Get Countries with thier leagues' })
  async getLeaguesByCountries(): Promise<League[]> {
    let LeaguesByCountries = await this.footballService.getLeaguesByCountries();

    return LeaguesByCountries;
  }

  // Get Leagues by country :
  @Get('/:countryId/leagues')
  @ApiOperation({ summary: 'Get Leauges by Country Id' })
  async getLeaguesByCountry(
    @Param('countryId') countryId: string,
  ): Promise<League[]> {
    let leaguesByCountry = await this.footballService.getLeaguesByCountry(
      countryId,
    );

    return leaguesByCountry;
  }

  // Get Logo by id :
  @Get('getLogo/:id')
  @ApiOperation({ summary: 'Get Logo by Id' })
  @Header('content-type', 'image/png')
  async getLogo(@Res() res, @Param('id') id: string) {
    let logo = await this.footballService.getLogo(id);
    res.send(logo.data);
  }

  // Get Flag :
  @Get('getFlag/:id')
  @ApiOperation({ summary: 'Get Flag by Id' })
  @Header('content-type', 'image/png')
  async getFlag(@Res() res, @Param('id') id: string) {
    let logo = await this.footballService.getFlag(id);
    res.send(logo.data);
  }

  // List of Teams per country :
  @Get('/:countryId/teams')
  @ApiOperation({ summary: 'Get Teams by Country Id' })
  async getTeamsByCountry(
    @Param('countryId') countryId: string,
  ): Promise<Team[]> {
    let teamsByLeague = await this.footballService.getTeamsByCountry(countryId);

    return teamsByLeague;
  }

  // Games :
  // List of games per league :
  // TODO : Add Filters && Pagination
  @Get('/:leagueId/games')
  @ApiOperation({ summary: 'Get Games by League Id' })
  async getGamesByLeagueId(
    @Param('leagueId') leagueId: string,
  ): Promise<Team[]> {
    let gamesByLeague = await this.footballService.getGamesByLeague(leagueId);

    return gamesByLeague;
  }

  @Get('/games')
  @ApiOperation({ summary: 'Get Games ' })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getGames(@Query() { skip, limit }: PaginationParams): Promise<Game[]> {
    // 100 max ??:
    limit = limit > 100 ? 100 : limit;
    let games = await this.footballService.getGames(skip, limit);

    return games;
  }
}
