import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { League } from 'src/schemas/league.schema';
import { Team } from 'src/schemas/team.schema';
import { FootballService } from './football.service';

@Controller('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('countries')
  async getCountries(): Promise<Country[]> {
    return this.footballService.getCountries();
  }
  @Get('leagues')
  async getLeagues(): Promise<League[]> {
    let leagues = await this.footballService.getLeagues();
    return leagues;
  }

  @Get('teams')
  async getTeams(): Promise<Team[]> {
    let teams = await this.footballService.getTeams();
    return teams;
  }

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
}
