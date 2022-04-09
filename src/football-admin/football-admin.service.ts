import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer-core';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Sport, SportDocument } from 'src/schemas/sport.schema';

@Injectable()
export class FootballAdminService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
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
}
