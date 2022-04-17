import { Controller, Get, Req } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminService } from './football-admin.service';
import { Season } from 'src/schemas/season.schema';
import { FootballAdminRepository } from './football-admin.repository';
import { Team } from 'src/schemas/team.schema';
import { League } from 'src/schemas/league.schema';

@Controller('football-admin')
export class FootballAdminController {
  constructor(
    private readonly footballAdminService: FootballAdminService,
    private readonly footballAdminRepository: FootballAdminRepository,
  ) {}

  @Get('scrapeCountries')
  async scrapeCountries(): Promise<Country[]> {
    console.time('scrapeCountries');
    await this.footballAdminService.launchPuppeteerBrowser();

    let countries: Country[] = [];
    try {
      let countriesNames: string[] =
        await this.footballAdminService.scrapeCountries();

      countries = await this.footballAdminRepository.findElseSaveCountries(
        countriesNames,
      );
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
    console.timeEnd('scrapeCountries');
    return countries;
  }

  @Get('scrapeAllLeagues')
  async scrapeAllLeagues(): Promise<League[]> {
    console.time('scrapeAllLeagues');
    await this.footballAdminService.launchPuppeteerBrowser();
    let leagues = [];
    try {
      leagues = await this.footballAdminService.scrapeAndSaveAllLeagues();
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
    console.timeEnd('scrapeAllLeagues');
    return leagues;
  }

  @Get('scrapeAllTeams')
  async scrapeAllTeams(): Promise<Team[]> {
    console.time('scrapeAllTeams');
    await this.footballAdminService.launchPuppeteerBrowser();
    let teams = [];
    try {
      teams = await this.footballAdminService.scrapeAndSaveAllTeams();
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
    console.timeEnd('scrapeAllTeams');
    return teams;
  }

  @Get('scrapeAllSeasons')
  async scrapeAllSeasons(@Req() req): Promise<any> {
    req.on('close', () => this.footballAdminService.closePuppeteerBrowser());

    await this.footballAdminService.launchPuppeteerBrowser();
    let seasons: Season[] = [];
    try {
      await this.footballAdminService.scrapeAndSaveAllSeasons()
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }

    return seasons;
  }
}
