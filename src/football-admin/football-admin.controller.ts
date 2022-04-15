import { Controller, Get } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminService } from './football-admin.service';
import { Season } from 'src/schemas/season.schema';
import { FootballAdminRespository } from './football-admin.repository';

@Controller('football-admin')
export class FootballAdminController {
  constructor(
    private readonly footballAdminService: FootballAdminService,
    private readonly footballAdminRespository: FootballAdminRespository,
  ) {}

  @Get('scrapeCountries')
  async scrapeCountries(): Promise<Country[]> {
    console.time('scrapeCountries');
    await this.footballAdminService.launchPuppeteerBrowser();

    let countries: Country[] = [];
    try {
      let countriesNames: string[] =
        await this.footballAdminService.scrapeCountries();

      countries = await this.footballAdminRespository.findElseSaveCountries(
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

  @Get('scrapeLeagues')
  async scrapeLeagues(): Promise<any> {
    await this.footballAdminService.launchPuppeteerBrowser();
    let leagues = [];
    try {
      let countries = await this.footballAdminRespository.getCountries();

      for (let i = 0; i < countries.length; i++) {
        let countryLeaguesNames = await this.footballAdminService.scrapeLeagues(
          countries[i],
        );
        console.log(countryLeaguesNames);
        for (let j = 0; j < countryLeaguesNames.length; j++) {
          leagues.push(
            await this.footballAdminRespository.findElseSaveLeague(
              countryLeaguesNames[j],
              countries[i],
            ),
          );
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      await this.footballAdminService.closePuppeteerBrowser();
    }
    return leagues;
  }

  @Get('scrapeTeams')
  async scrapeTeams(): Promise<any> {
    await this.footballAdminService.launchPuppeteerBrowser();
    try {
      let leagues = await this.footballAdminRespository.getLeagues();
      for (let i = 0; i < 1; i++) {
        console.log(i + ' league: ' + leagues[i].name);
        let teamsInfo = await this.footballAdminService.scrapeTeams(leagues[i]);

        for (let i = 0; i < teamsInfo.length; i++) {
          let team = await this.footballAdminRespository.findElseSaveTeam(
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
      let leagues = await this.footballAdminRespository.getLeagues();

      for (let i = 0; i < leagues.length; i++) {
        console.log(leagues[i]);
        let finishedSeasonsInfo =
          await this.footballAdminService.scrapeFinishedSeasons(leagues[i]);

        for (let i = 0; i < finishedSeasonsInfo.length; i++) {
          finishedSeasons.push(
            await this.footballAdminRespository.findElseSaveFinishedSeason(
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
