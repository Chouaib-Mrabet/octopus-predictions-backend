import { Injectable } from '@nestjs/common';
import { League } from 'src/schemas/league.schema';
import * as puppeteer from 'puppeteer-core';
import { Country } from 'src/schemas/country.schema';

@Injectable()
export class FootballAdminService {
  constructor() {}

  async scrapeCountries(): Promise<string[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    try {
      const page = await browser.newPage();

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

      await browser.close();
      return countriesNames;
    } catch (err) {
      console.log(err);
      await browser.close();
    }
  }

  async scrapeCountryFlag(countryName: string) {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage();

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

      await browser.close();
      if (!countryFlagId) countryFlagId = 'world.b7d16db.';
      return countryFlagId;
    } catch (err) {
      console.log(err);
      await browser.close();
    }
  }

  async scrapeLeagues(country: Country): Promise<string[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    try {
      const page = await browser.newPage();

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
          );
        },
      );

      await browser.close();

      return leaguesNames;
    } catch (err) {
      console.log(err);
      await browser.close();
    }
  }

  async scrapeTeams(league: League): Promise<
    {
      teamName: string;
      teamFlashscoreId: string;
    }[]
  > {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    try {
      const page = await browser.newPage();

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

      await browser.close();

      return teamsInfo;
    } catch (err) {
      console.log(err);
      await browser.close();
    }
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
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });

    const page = await browser.newPage();

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

    await browser.close();

    return { teamName, teamFlashscoreId, countryName, logoFlashscoreId };
  }

  async scrapeFinishedSeasons(
    league: League,
  ): Promise<
    { seasonName: string; winnerFlashscoreId: string; winnerName: string }[]
  > {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    try {
      const page = await browser.newPage();

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

      await browser.close();
      return finishedSeasons;
    } catch (err) {
      console.log(err);
      await browser.close();
    }
  }
}
