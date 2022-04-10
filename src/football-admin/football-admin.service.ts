import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer-core';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Sport, SportDocument } from 'src/schemas/sport.schema';
import { Team, TeamDocument } from 'src/schemas/team.schema';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
const axios = require('axios').default;

@Injectable()
export class FootballAdminService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Logo.name) private logoModel: Model<LogoDocument>,
  ) {}

  async scrapeCountries(): Promise<string[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
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
  }

  async saveCountry(countryName: string): Promise<Country> {
    let existingCountry = await this.countryModel.findOne({
      name: countryName,
    });
    if (existingCountry) return existingCountry;

    let newCountry = new this.countryModel({ name: countryName });
    try {
      await newCountry.save();
    } catch (e) {
      console.log('error', countryName);
    }
    return newCountry;
  }

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find();
  }

  async getLeagues(): Promise<League[]> {
    return await this.leagueModel.find().populate('country');
  }

  async getTeams(): Promise<Team[]> {
    return await this.teamModel.find().populate('logo');
  }

  async scrapeLeagues(country: Country): Promise<string[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
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
  }

  async saveLeague(leagueName: string, country: Country): Promise<League> {
    let football = await this.sportModel.findOne({ name: 'football' });
    let existingLeague = await this.leagueModel.findOne({
      name: leagueName,
      country: country,
      sport: football,
    });
    if (existingLeague) return existingLeague;

    let newLeague = new this.leagueModel({ name: leagueName });
    newLeague.country = country;
    newLeague.sport = football;
    try {
      await newLeague.save();
    } catch (error) {
      console.log(error, newLeague);
    }
    return newLeague;
  }

  async scrapeTeams(league: League): Promise<
    {
      teamName: string;
      teamFlashscoreId: string;
      countryName: string;
      logoFlashscoreId: string;
    }[]
  > {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
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
          countryName: null,
          logoFlashscoreId: null,
        }));
      },
    );

    for (let i = 0; i < teamsInfo.length; i++) {
      await page.goto(
        `https://www.flashscore.com/team/${teamsInfo[i].teamName}/${teamsInfo[i].teamFlashscoreId}/`,
        {
          waitUntil: 'load',
          timeout: 0,
        },
      );

      let countryName = await page.$$eval(
        '.breadcrumb__link',
        (elements) => elements[1].getAttribute('href').split('/')[2],
      );

      let logoId = await page.$eval(
        '.heading__logo',
        (element: HTMLElement) =>
          element.style.backgroundImage.slice(5, -6).split('/')[4],
      );

      teamsInfo[i].countryName = countryName;
      teamsInfo[i].logoFlashscoreId = logoId;
    }

    await browser.close();

    return teamsInfo;
  }

  async saveTeam(
    teamName: string,
    teamFlashscoreId: string,
    logoFlashscoreId: string,
    countryName: string,
  ): Promise<Team> {
    try {
      let team = await this.teamModel.findOne({
        name: teamName,
        flashscoreId: teamFlashscoreId,
      });

      if (team) return team;

      let country = await this.countryModel.findOne({ name: countryName });
      let logo = await this.logoModel.findOne({
        flashscoreId: logoFlashscoreId,
      });
      if (logo == null) {
        logo = new this.logoModel({ flashscoreId: logoFlashscoreId });
        let logoUrl = `https://www.flashscore.com/res/image/data/${logoFlashscoreId}.png`;
        logo.data = Buffer.from(
          (await axios.get(logoUrl, { responseType: 'arraybuffer' })).data,
          'utf-8',
        );
        await logo.save();
      }
      let football = await this.sportModel.findOne({ name: 'football' });
      team = new this.teamModel({
        name: teamName,
        sport: football,
        flashscoreId: teamFlashscoreId,
        logo: logo,
        country: country,
      });

      team.save();
      return team;
    } catch (error) {
      console.log(error, teamName, teamFlashscoreId);
    }
  }

  // async saveTeam() {
  //   let football = await this.sportModel.findOne({ name: 'football' });
  //   let albania = await this.countryModel.findOne({ name: 'albania' });

  //   let logoUrl =
  //     'https://www.flashscore.com/res/image/data/EwJqZUZA-Onr593up.png';

  //   const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
  //   const buffer = Buffer.from(response.data, 'utf-8');
  //   return buffer;

  // let team = new this.teamModel({
  //   name: 'test',
  //   country: albania,
  //   sport: football,
  // });
  // return await team.save();
  // }
}
