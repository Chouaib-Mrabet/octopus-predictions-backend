import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { League } from 'src/schemas/league.schema';
import * as puppeteer from 'puppeteer-core';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminRespository } from './football-admin.repository';

@Injectable()
export class FootballAdminService {
  private browser: puppeteer.Browser;
  constructor(
    @Inject(forwardRef(() => FootballAdminRespository))
    private readonly footballAdminRespository: FootballAdminRespository,
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
    if (this.browser.isConnected()) await this.browser.close();
  }

  async scrapeCountries(): Promise<string[]> {
    const page = await this.browser.newPage();

    let url = 'https://www.flashscore.com/football';
    await page.goto(url, {
      waitUntil: 'networkidle2',
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
    // console.table(countriesNames);

    await page.close();
    return countriesNames;
  }

  async scrapeCountryFlag(countryName: string) {
    const page = await this.browser.newPage();

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
    const page = await this.browser.newPage();

    await page.goto(`https://www.flashscore.com/football/${country.name}`, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    let countryLeaguesListElement = await page.$('div.selected-country-list');

    let leaguesNames = await countryLeaguesListElement.$$eval(
      'a.leftMenu__href',
      (leagues) => {
        return leagues.map(
          (league) => league.getAttribute('href').split('/')[3],
        ).filter(league=>league!=null);
      },
    );

    await page.close();

    return { leaguesNames, country };
  }

  async scrapeAndSaveAllLeagues(): Promise<League[]> {
    let leagues: League[] = [];
    let countries = await this.footballAdminRespository.getCountries();

    let i = 0;
    let j = 0;
    let maximumParallelCalls = 20;
    let parallelScrapping: Promise<{
      leaguesNames: string[];
      country: Country;
    }>[] = [];

    while (i < countries.length) {
      j = i;
      parallelScrapping = [];
      while (j < countries.length && j - i < maximumParallelCalls) {
        parallelScrapping.push(this.scrapeLeagues(countries[j]));
        j++;
      }
      i = j;
      await Promise.all(parallelScrapping).then(async (countriesLeagues) => {
        let parallelSaving: Promise<League>[] = [];
        countriesLeagues.forEach((countryLeagues) => {
          let country: Country = countryLeagues.country;
          let leaguesNames: string[] = countryLeagues.leaguesNames;
          leaguesNames.forEach((leagueName) =>
            parallelSaving.push(
              this.footballAdminRespository.findElseSaveLeague(
                leagueName,
                country,
              ),
            ),
          );
        });
        await Promise.all(parallelSaving).then((newLeagues) =>
          leagues.push(...newLeagues),
        );
        console.log('total leagues :', leagues.length);
      });
    }

    /////////////////////////////
    // for (let i = 0; i < countries.length; i++) {
    //   let countryLeaguesNames = await this.scrapeLeagues(countries[i]);
    //   console.log(countryLeaguesNames);
    //   for (let j = 0; j < countryLeaguesNames.length; j++) {
    //     if (countryLeaguesNames[j] == null) {
    //       console.log('league name is null', countries[i]);
    //       continue;
    //     }
    //     leagues.push(
    //       await this.footballAdminRespository.findElseSaveLeague(
    //         countryLeaguesNames[j],
    //         countries[i],
    //       ),
    //     );
    //   }
    // }
    ///////////////////////////////

    return leagues;
  }

  async scrapeTeams(league: League): Promise<
    {
      teamName: string;
      teamFlashscoreId: string;
    }[]
  > {
    const page = await this.browser.newPage();

    let url = `https://www.flashscore.com/football/${league.country.name}/${league.name}/standings`;

    await page.goto(url, {
      waitUntil: 'load',
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
    const page = await this.browser.newPage();

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

  async scrapeFinishedSeasons(
    league: League,
  ): Promise<
    { seasonName: string; winnerFlashscoreId: string; winnerName: string }[]
  > {
    const page = await this.browser.newPage();

    await page.goto(
      `https://www.flashscore.com/football/${league.country.name}/${league.name}/archive`,
      {
        waitUntil: 'networkidle2',
        timeout: 0,
      },
    );

    let finishedSeasons = await page.$$eval('.archive__row', (rows) =>
      rows
        .filter(
          (row) =>
            row
              .querySelector('.archive__winner')
              .querySelector('.archive__text') != null,
        )
        .map((row) => ({
          seasonName: row
            .querySelector('.archive__season')
            .querySelector('.archive__text')
            .getAttribute('href')
            .split('/')[3],
          winnerFlashscoreId: row
            .querySelector('.archive__winner')
            .querySelector('.archive__text')
            .getAttribute('href')
            .split('/')[3],

          winnerName: row
            .querySelector('.archive__winner')
            .querySelector('.archive__text')
            .getAttribute('href')
            .split('/')[2],
        })),
    );

    await page.close();
    return finishedSeasons;
  }
}
