import { Controller, Get } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminService } from './football-admin.service';
import { Season } from 'src/schemas/season.schema';
import { FootballAdminRepository } from './football-admin.repository';

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
  async scrapeAllLeagues(): Promise<any> {
    console.time('scrapeAllLeagues')
    await this.footballAdminService.launchPuppeteerBrowser();
    let leagues = [];
    try {

      await this.footballAdminService.scrapeAndSaveAllLeagues()


    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
    console.timeEnd('scrapeAllLeagues')
    return leagues;
  }

  @Get('scrapeTeams')
  async scrapeTeams(): Promise<any> {
    await this.footballAdminService.launchPuppeteerBrowser();
    try {
      let leagues = await this.footballAdminRepository.getLeagues();
      for (let i = 0; i < 1; i++) {
        console.log(i + ' league: ' + leagues[i].name);
        let teamsInfo = await this.footballAdminService.scrapeTeams(leagues[i]);

        for (let i = 0; i < teamsInfo.length; i++) {
          let team = await this.footballAdminRepository.findElseSaveTeam(
            teamsInfo[i].teamName,
            teamsInfo[i].teamFlashscoreId,
          );
          console.log(team.name);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
  }

  @Get('scrapeFinishedSeasons')
  async scrapeFinishedSeasons(): Promise<any> {
    await this.footballAdminService.launchPuppeteerBrowser();
    let finishedSeasons: Season[] = [];
    try {
      let leagues = await this.footballAdminRepository.getLeagues();

      for (let i = 0; i < leagues.length; i++) {
        console.log(leagues[i]);
        let finishedSeasonsInfo =
          await this.footballAdminService.scrapeFinishedSeasons(leagues[i]);

        for (let i = 0; i < finishedSeasonsInfo.length; i++) {
          finishedSeasons.push(
            await this.footballAdminRepository.findElseSaveFinishedSeason(
              leagues[i],
              finishedSeasonsInfo[i].seasonName,
              finishedSeasonsInfo[i].winnerFlashscoreId,
              finishedSeasonsInfo[i].winnerName,
            ),
          );
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }

    return finishedSeasons;
  }
}
