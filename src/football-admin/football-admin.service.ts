import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { League } from 'src/schemas/league.schema';
import * as puppeteer from 'puppeteer-core';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminRepository } from './football-admin.repository';
import { Team } from 'src/schemas/team.schema';
import { Season } from 'src/schemas/season.schema';

@Injectable()
export class FootballAdminService {
  private browser: puppeteer.Browser;
  constructor(
    @Inject(forwardRef(() => FootballAdminRepository))
    private readonly footballAdminRepository: FootballAdminRepository,
  ) {}

  async launchPuppeteerBrowser() {
    if (this.browser == null || !this.browser.isConnected()) {
      console.log('creating puppeteer browser instance');
      this.browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--disable-gpu', '--window-size=1920,1080', '--no-sandbox'],
      });
    }
  }

  async closePuppeteerBrowser() {
    if (this.browser.isConnected()) {
      await this.browser.close();
      console.log('closing puppeteer browser instance');
    }
  }
  async getPage(): Promise<puppeteer.Page> {
    let page = await this.browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (
        req.resourceType() == 'stylesheet' ||
        req.resourceType() == 'font' ||
        req.resourceType() == 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  async scrapeCountries(): Promise<string[]> {
    let page = await this.getPage();

    let url = 'https://www.flashscore.com/football';
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    let countriesNames = [];
    await page.waitForSelector('[id="onetrust-accept-btn-handler"]');
    await page.click('[id="onetrust-accept-btn-handler"]');
    await page.waitForNetworkIdle();
    await page.waitForSelector('[class="lmc__itemMore"]');
    await page.click('[class="lmc__itemMore"]');
    countriesNames = await page.$$eval(
      'a.lmc__element.lmc__item',
      (elements) => {
        return elements.map(
          (element) => element.getAttribute('href').split('/')[2],
        );
      },
    );

    await page.close();

    return countriesNames;
  }

  async scrapeCountryFlag(countryName: string) {
    let page = await this.browser.newPage(); //stylesheet needed

    let url = `https://www.flashscore.com/football/${countryName}/`;

    await page.goto(url, {
      waitUntil: 'load',
      timeout: 0,
    });

    let countryFlagId = await page.$eval('.breadcrumb__flag.flag', (flag) => {
      let url = getComputedStyle(flag)
        .getPropertyValue('background-image')
        .slice(5, -6)
        .split('/')[6];
      return url;
    });

    await page.close();
    if (!countryFlagId) countryFlagId = 'world.b7d16db.';
    return countryFlagId;
  }

  async scrapeLeagues(
    country: Country,
  ): Promise<{ leaguesNames: string[]; country: Country }> {
    console.log(country.name);
    let page = await this.getPage();

    await page.goto(`https://www.flashscore.com/football/${country.name}`, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    let countryLeaguesListElement = await page.$('div.selected-country-list');
    let leaguesNames = [];
    if (countryLeaguesListElement)
      leaguesNames = await countryLeaguesListElement.$$eval(
        'a.leftMenu__href',
        (leagues) => {
          return leagues.map(
            (league) => league.getAttribute('href').split('/')[3],
          );
        },
      );

    if (leaguesNames)
      leaguesNames = leaguesNames.filter((leagueName) => leagueName != null);

    await page.close();

    return { leaguesNames, country };
  }

  async scrapeAndSaveAllLeagues(): Promise<League[]> {
    let leagues: League[] = [];
    let countries = await this.footballAdminRepository.getCountries();
    let maximumParallelScrapping = 1;

    while (countries.length > 0) {
      await Promise.all(
        countries
          .splice(0, maximumParallelScrapping)
          .map((country) => this.scrapeLeagues(country)),
      ).then(async (leaguesByCountry) => {
        for (let leaguesOfOneCountry of leaguesByCountry) {
          for (let league of leaguesOfOneCountry.leaguesNames) {
            leagues.push(
              await this.footballAdminRepository.findElseSaveLeague(
                league,
                leaguesOfOneCountry.country,
              ),
            );
            console.log(league + ' : ' + leaguesOfOneCountry.country.name);
          }
        }
      });
    }

    return leagues;
  }

  async scrapeAndSaveAllTeams(): Promise<Team[]> {
    let leagues = await this.footballAdminRepository.getLeagues();
    let teams: Team[] = [];

    let maximumLeaguesParallelScrapping = 10;
    let maximumTeamsParallelScrapping = 30;

    while (leagues.length > 0) {
      let subLeaguesScrapping = leagues
        .splice(0, maximumLeaguesParallelScrapping)
        .map((league) => this.scrapeTeams(league));
      await Promise.all(subLeaguesScrapping)
        .then(async (teamsByLeague) => {
          let allTeams = [];

          for (let teamsOfOneLeague of teamsByLeague) {
            allTeams.push(...teamsOfOneLeague);
          }

          while (allTeams.length > 0) {
            let subTeamsScrapping = allTeams
              .splice(0, maximumTeamsParallelScrapping)
              .map((team) =>
                this.scrapeTeamInfo(team.teamName, team.teamFlashscoreId),
              );
            await Promise.all(subTeamsScrapping)
              .then(async (teamsInfo) => {
                for (let teamInfo of teamsInfo) {
                  teams.push(
                    await this.footballAdminRepository.findElseSaveTeam(
                      teamInfo.teamName,
                      teamInfo.teamFlashscoreId,
                      teamInfo.countryName,
                      teamInfo.logoFlashscoreId,
                    ),
                  );
                }
                console.log('total teams :', teams.length);
                console.timeLog('scrapeAllTeams');
              })
              .catch((err) => {
                console.log(err, 'error: ', subTeamsScrapping);
              });
          }
        })
        .catch((err) => {
          console.log(err, 'error: ', subLeaguesScrapping);
        });
    }

    return teams;
  }

  async scrapeTeams(league: League): Promise<
    {
      teamName: string;
      teamFlashscoreId: string;
    }[]
  > {
    console.log('scrapping teams of ' + league.name);
    let page = await this.getPage();

    let url = `https://www.flashscore.com/football/${league.country.name}/${league.name}/standings`;

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    let teamsInfo = await page.$$eval(
      '.tableCellParticipant__image',
      (teamsDomElements) => {
        return teamsDomElements.map((teamDomElement) => ({
          teamName: teamDomElement.getAttribute('href').split('/')[2],
          teamFlashscoreId: teamDomElement.getAttribute('href').split('/')[3],
        }));
      },
    );

    await page.close();
    if (teamsInfo.length == 0) console.log('0 teams: ' + league.name);

    return teamsInfo;
  }

  async scrapeTeamInfo(
    teamName: string,
    teamFlashscoreId: string,
  ): Promise<{
    teamName: string;
    teamFlashscoreId: string;
    countryName: string;
    logoFlashscoreId: string;
  }> {
    console.log('scrapping : ' + teamName);
    let page = await this.getPage();

    await page.goto(
      `https://www.flashscore.com/team/${teamName}/${teamFlashscoreId}/`,
      {
        waitUntil: 'load',
        timeout: 0,
      },
    );

    let countryName = await page.$$eval(
      '.breadcrumb__link',
      (elements) => elements[1].getAttribute('href').split('/')[2],
    );

    let logoFlashscoreId = await page.$eval(
      '.heading__logo',
      (element: HTMLElement) =>
        element.style.backgroundImage.slice(5, -6).split('/')[4],
    );

    await page.close();

    return { teamName, teamFlashscoreId, countryName, logoFlashscoreId };
  }

  async scrapeSeasons(league: League): Promise<{
    seasons: {
      seasonName: string;
      winnerFlashscoreId: string;
      winnerName: string;
      finished: boolean;
      league: League;
    }[];
    league: League;
  }> {
    let page = await this.getPage();
    let seasonsInfo = [];

    try {
      await page.goto(
        `https://www.flashscore.com/football/${league.country.name}/${league.name}/archive`,
        {
          waitUntil: 'networkidle2',
          timeout: 0,
        },
      );

      seasonsInfo = await page.$$eval('.archive__row', (rows) =>
        rows.map((row) => {
          let finished = true;
          let winnerName = null;
          let winnerFlashscoreId = null;

          if (row.querySelector('.archive__winner') != null) {
            if (
              row
                .querySelector('.archive__winner')
                .querySelector('.archive__text') == null
            )
              finished = false;

            if (finished) {
              let winnerUrl = row
                .querySelector('.archive__winner')
                .querySelector('.archive__text')
                .getAttribute('href');
              //some finished season has no winner
              if (winnerUrl != null) {
                winnerName = winnerUrl.split('/')[2];
                winnerFlashscoreId = winnerUrl.split('/')[3];
              }
            }
          }

          return {
            seasonName: row
              .querySelector('.archive__season')
              .querySelector('.archive__text')
              .getAttribute('href')
              .split('/')[3],
            winnerFlashscoreId: winnerFlashscoreId,
            winnerName: winnerName,
            finished: finished,
          };
        }),
      );
    } catch (err) {
      console.log(league, 'error:', err);
    } finally {
      await page.close();
      return { seasons: seasonsInfo, league: league };
    }
  }

  async scrapeAndSaveAllSeasons() {
    console.time('scrapeAllSeasons');
    let leagues = await this.footballAdminRepository.getLeagues();
    let maximumLeaguesParallelScrapping = 20;
    let seasons: Season[] = [];

    while (leagues.length > 0) {
      let subLeaguesScrapping = leagues
        .splice(0, maximumLeaguesParallelScrapping)
        .map((league) => this.scrapeSeasons(league));
      await Promise.all(subLeaguesScrapping).then(async (seasonsByLeagues) => {
        for (let seasonsByOneLeague of seasonsByLeagues) {
          for (let season of seasonsByOneLeague.seasons) {
            seasons.push(
              await this.footballAdminRepository.findElseSaveSeason(
                seasonsByOneLeague.league,
                season.seasonName,
                season.winnerFlashscoreId,
                season.winnerName,
                season.finished,
              ),
            );
          }
        }
        console.log('total seasons :', seasons.length);
        console.log('remaining leagues :', leagues.length);
        console.timeLog('scrapeAllSeasons');
      });
    }
    console.timeEnd('scrapeAllSeasons');
  }

  async scrapeAndSaveAllMatches(season:Season){
    await this.footballAdminRepository.findElseSaveMatch()
  }
}
