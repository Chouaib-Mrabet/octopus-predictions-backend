import { Season } from './../schemas/season.schema';
import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import { Team } from './../schemas/team.schema';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { FootballService } from './football.service';
import { PaginationParams } from 'src/dto/pagination-params';
import { Match } from 'src/schemas/match.schema';

@Controller('football')
@ApiTags('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  // List of All leagues :
  @Get('leagues')
  @ApiOperation({ summary: 'Get All Leagues' })
  async getLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getLeagues();
    return leagues;
  }

  // Leagues By Team:
  @Get('leagues/:teamId')
  @ApiOperation({ summary: 'Get Leagues By team' })
  async getLeaguesByTeam(@Param('teamId') teamId: string): Promise<League[]> {
    let leagues = await this.footballService.getLeaguesByTeamId(teamId);

    return leagues;
  }

  // List of Matches :
  @Get('/matches')
  @ApiOperation({ summary: 'Get Matches' })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getMatches(
    @Query() { skip, limit }: PaginationParams,
  ): Promise<Match[]> {
    // 100 max ??:
    limit = limit > 100 ? 100 : limit;
    let matches = await this.footballService.getMatches(skip, limit);

    return matches;
  }
  // Get Match by id :
  @Get('/match/:id')
  @ApiOperation({ summary: 'Get Match by id' })
  async getMatch(@Param('id') id: string): Promise<Match> {
    let match = await this.footballService.getMatchById(id);
    return match;
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

  // List of matches per Season :
  @Get('/:seasonId/matches')
  @ApiOperation({ summary: 'Get Matches by Season Id' })
  async getMatchesBySeasonId(
    @Param('seasonId') seasonId: string,
  ): Promise<Match[]> {
    let matchesBySeason = await this.footballService.getMatchesBySeason(
      seasonId,
      1,
    );

    return matchesBySeason;
  }

  // List of Finished Matches per Season :
  @Get('/:seasonId/matches/finished')
  @ApiOperation({ summary: 'Get Finished Matches by Season Id' })
  async getFinishedMatchesBySeasonId(
    @Param('seasonId') seasonId: string,
  ): Promise<Match[]> {
    let matchesBySeason = await this.footballService.getMatchesBySeason(
      seasonId,
      2,
    );

    return matchesBySeason;
  }

  // List of NOT finished matches per Season :
  @Get('/:seasonId/matches/notfinished')
  @ApiOperation({ summary: 'Get Matches by Season Id' })
  async getNotFinishedMatchesBySeasonId(
    @Param('seasonId') seasonId: string,
  ): Promise<Match[]> {
    let matchesBySeason = await this.footballService.getMatchesBySeason(
      seasonId,
      3,
    );

    return matchesBySeason;
  }

  // List of matches per team :
  @Get('/:teamId/teammatches')
  @ApiOperation({ summary: 'Get Matches by Team Id' })
  async getMatchesByTeamId(@Param('teamId') teamId: string): Promise<Match[]> {
    let matchesByTeam = await this.footballService.getMatchesByTeam(teamId);

    return matchesByTeam;
  }

  // List of matches per Season and Team :
  @Get('/:seasonId/matches/:teamId')
  @ApiOperation({ summary: 'Get Matches by Season Id' })
  async getMatchesBySeasonAndTeamIds(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
  ): Promise<Match[]> {
    let matches = await this.footballService.getMatchesBySeasonAndTeam(
      seasonId,
      teamId,
    );

    return matches;
  }

  // List of Seasons per League :
  @Get('/:LeagueId/season')
  @ApiOperation({ summary: 'Get Seasons by League Id' })
  async getSeasonsByLeagueId(
    @Param('LeagueId') LeagueId: string,
  ): Promise<Season[]> {
    let seasonsByLeague = await this.footballService.getSeasonsByLeague(
      LeagueId,
    );

    return seasonsByLeague;
  }
}
