import { Team } from './../schemas/team.schema';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  // Favorites :
  // List of my favorite games  :
  // TODO : Add Filters && Pagination
  // @Get('/favorite/games')
  // @UseGuards(JwtAuthGuard)
  // async getFavoriteGames(@Userd() userd): Promise<Game[]> {
  //   let favoriteGames = await this.footballService.getFavoriteGames(userd);

  //   return favoriteGames;
  // }
}
