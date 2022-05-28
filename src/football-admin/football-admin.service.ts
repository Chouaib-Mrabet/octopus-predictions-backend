import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { League } from 'src/schemas/league.schema';
import * as puppeteer from 'puppeteer-core';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminRepository } from './football-admin.repository';
import { Team } from 'src/schemas/team.schema';
import { Season } from 'src/schemas/season.schema';
import { MatchDocument } from 'src/schemas/match.schema';

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
    await page.setViewport({ width: 1920, height: 1080 });
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
  ): Promise<{ leagueName: string; country: Country }[]> {
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

    let leaguesInfo = leaguesNames.map((leagueName) => ({
      leagueName: leagueName,
      country: country,
    }));

    await page.close();

    return leaguesInfo;
  }

  async scrapeAndSaveAllLeagues(): Promise<League[]> {
    let leagues: any[] = [];
    let countries = await this.footballAdminRepository.getCountries();
    let maximumParallelCountriesScrapping = 10;
    let maximumParallelLeaguesScrapping = 15;

    while (countries.length > 0) {
      let countriesScrapping = countries
        .splice(0, maximumParallelCountriesScrapping)
        .map((country) => this.scrapeLeagues(country));
      await Promise.all(countriesScrapping).then(async (leaguesByCountry) => {
        let allLeagues: {
          leagueName: string;
          country: Country;
        }[] = [];
        for (let leaguesOfOneCountry of leaguesByCountry) {
          allLeagues.push(...leaguesOfOneCountry);
        }
        while (allLeagues.length > 0) {
          let leaguesScrapping = allLeagues
            .splice(0, maximumParallelLeaguesScrapping)
            .map((league) =>
              this.scrapeLeagueInfo(league.leagueName, league.country),
            );
          await Promise.all(leaguesScrapping).then(async (leaguesInfo) => {
            for (let leagueInfo of leaguesInfo) {
              leagues.push(
                await this.footballAdminRepository.findElseSaveLeague(
                  leagueInfo.leagueName,
                  leagueInfo.country,
                  leagueInfo.logoFlashscoreId,
                ),
              );
            }
          });
        }
      });
    }

    return leagues;
  }

  async scrapeLeagueInfo(
    leagueName: string,
    country: Country,
  ): Promise<{
    leagueName: string;
    country: Country;
    logoFlashscoreId: string;
  }> {
    let logoFlashscoreId = null;
    let page = await this.getPage();
    try {
      console.log('scrapping : ' + leagueName);
      let url = `https://www.flashscore.com/football/${country.name}/${leagueName}/`;
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 0,
      });
      logoFlashscoreId = await page.$eval(
        '.heading__logo',
        (element: HTMLElement) =>
          element.style.backgroundImage.slice(5, -6).split('/')[4],
      );
    } catch (err) {
      console.log(err, country.name, leagueName);
    }

    await page.close();

    return { leagueName, country, logoFlashscoreId };
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
        rows.map((row, index) => {
          let finished = true;
          let winnerName = null;
          let winnerFlashscoreId = null;
          let seasonName = '';

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

          if (index == 0) {
            //for the current/last season flashscore doesn't add date (they use the league name directly)
            seasonName = row
              .querySelector('.archive__season')
              .textContent.toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/\//g, '-');
          } else {
            seasonName = row
              .querySelector('.archive__season')
              .querySelector('.archive__text')
              .getAttribute('href')
              .split('/')[3];
          }

          return {
            seasonName: seasonName,
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

  async scrapeAndSaveSeasonsOfOneLeague(leagueId: string) {
    console.time(`scrapeSeasons of ${leagueId}`);

    let league = await this.footballAdminRepository.getLeague(leagueId);
    let seasonsInfo = (await this.scrapeSeasons(league)).seasons;
    for (let season of seasonsInfo) {
      await this.footballAdminRepository.findElseSaveSeason(
        league,
        season.seasonName,
        season.winnerFlashscoreId,
        season.winnerName,
        season.finished,
      );
    }

    console.timeEnd(`scrapeSeasons of ${leagueId}`);
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

  async scrapeMatchesFlashscoreIds(season: Season) {
    let page: puppeteer.Page;
    let ids = [];
    try {
      for (let matchesType of ['results', 'fixtures']) {
        let url = `https://www.flashscore.com/football/${season.league.country.name}/${season.name}/${matchesType}`;

        page = await this.browser.newPage();
        //remove cookies consent banner
        await page.setCookie({
          name: 'eupubconsent-v2',
          value: 'true',
          domain: 'www.flashscore.com',
        });

        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 0,
        });

        let showMoreAvailable = true;
        while (showMoreAvailable) {
          try {
            await page.waitForSelector('.event__more', { timeout: 1000 });
          } catch (err) {
            console.log('not found');
            showMoreAvailable = false;
            continue;
          }
          console.log('more found');
          await page.click('.event__more');
          await page.waitForNetworkIdle();
        }

        ids.push(
          ...(await page.$$eval('.event__match', (elements) => {
            return elements.map((element) => element.getAttribute('id'));
          })),
        );
        await page.close();
      }
    } catch (err) {
      console.log('error:', err, season);
      await page.close();
    } finally {
      return { matchesFlashscoreIds: ids, season: season };
    }
  }

  async scrapeAndSaveAllMatches(season: Season) {
    console.time('scrapeAndSaveAllMatches');
    let matchesBySeason = await this.scrapeMatchesFlashscoreIds(season);
    let maximumMatchesParallelScrapping = 20;
    let matches = [];
    while (matchesBySeason.matchesFlashscoreIds.length > 0) {
      let matchesScrapping = matchesBySeason.matchesFlashscoreIds
        .splice(0, maximumMatchesParallelScrapping)
        .map((flashscoreMatchId) =>
          this.scrapeMatchInfo(flashscoreMatchId, matchesBySeason.season),
        );
      await Promise.all(matchesScrapping).then(async (matchesInfo) => {
        for (let matchInfo of matchesInfo) {
          matches.push(
            await this.footballAdminRepository.findElseSaveMatch(
              matchInfo.flashscoreMatchId,
              matchInfo.round,
              matchInfo.dateTimeMs,
              matchInfo.homeTeamIds,
              matchInfo.awayTeamIds,
              matchInfo.goals,
              matchInfo.season,
              matchInfo.finished,
            ),
          );

          console.log('matches: ' + matches.length);
          console.timeLog('scrapeAndSaveAllMatches');
        }
      });
    }

    console.timeEnd('scrapeAndSaveAllMatches');
  }

  async scrapeMatchInfo(
    flashscoreMatchId: string,
    season: Season,
  ): Promise<{
    flashscoreMatchId: string;
    round: string;
    dateTimeMs: number;
    homeTeamIds: {
      teamName: string;
      teamFlashscoreId: string;
    };
    awayTeamIds: {
      teamName: string;
      teamFlashscoreId: string;
    };
    goals: {
      time: string;
      homeTeam: boolean;
    }[];
    season: Season;
    finished: boolean;
  }> {
    console.log('scrapping : ' + flashscoreMatchId);
    let matchInfo = null;
    const page = await this.browser.newPage();
    try {
      let url = `https://www.flashscore.com/match/${flashscoreMatchId.slice(
        4,
      )}`;

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 0,
      });

      let round = await page.$eval('.tournamentHeader__country', (element) =>
        element
          .querySelector('a')
          .textContent.replace(/[^-]*-/, '')
          .trim(),
      );

      let dateTimeMs = await page.$eval(
        '.duelParticipant__startTime',
        (element) => {
          let dateTimeString = element.querySelector('div').textContent;
          let date = dateTimeString.split(' ')[0].split('.');
          let time = dateTimeString.split(' ')[1].split(':');
          let hours = time[0],
            minutes = time[1];
          let days = date[0],
            month = date[1],
            year = date[2];

          return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(days),
            parseInt(hours),
            parseInt(minutes),
          ).getTime();
        },
      );

      let homeTeamIds = await page.$eval(
        '.duelParticipant__home',
        (element) => {
          let teamInfo = element
            .querySelector('a.participant__participantName')
            .getAttribute('href')
            .split('/');
          return {
            teamName: teamInfo[2],
            teamFlashscoreId: teamInfo[3],
          };
        },
      );
      let awayTeamIds = await page.$eval(
        '.duelParticipant__away',
        (element) => {
          let teamInfo = element
            .querySelector('a.participant__participantName')
            .getAttribute('href')
            .split('/');
          return {
            teamName: teamInfo[2],
            teamFlashscoreId: teamInfo[3],
          };
        },
      );
      let goals = [];
      let finished = false;

      if (
        await page.$eval(
          '.detailScore__status',
          (element) => element.textContent == 'Finished',
        )
      ) {
        finished = true;
        goals = await page.$$eval('.smv__incident', (incidents) => {
          let scoreIncidents = incidents.filter(
            (incident) =>
              incident.querySelector('.smv__incidentHomeScore') != null ||
              incident.querySelector('.smv__incidentAwayScore') != null,
          );

          return scoreIncidents.map((scoreIncident) => {
            let time = scoreIncident
              .querySelector('.smv__timeBox')
              .textContent.slice(0, -1);
            let homeTeam = false;
            if (scoreIncident.querySelector('.smv__incidentHomeScore') != null)
              homeTeam = true;
            return { time, homeTeam };
          });
        });
      }

      matchInfo = {
        flashscoreMatchId,
        round,
        dateTimeMs,
        homeTeamIds,
        awayTeamIds,
        goals,
        season,
        finished,
      };
    } catch (err) {
      console.log('error:', flashscoreMatchId, err);
    } finally {
      await page.close();
      return matchInfo;
    }
  }

  async updateOutdatedMatches() {
    let outdatedMacthes =
      await this.footballAdminRepository.getOutdatedMatches();

    for (let match of outdatedMacthes) {
      let matchInfo = await this.scrapeMatchInfo(
        match.flashscoreId,
        match.season,
      );
      this.footballAdminRepository.updateOutdatedMatch(match['id'],matchInfo.goals,matchInfo.finished);
    }
    // console.log(outdatedMacthes);
  }
}
