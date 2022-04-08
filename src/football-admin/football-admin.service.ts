import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer-core';
import { Country, CountryDocument } from 'src/schemas/country.schema';

@Injectable()
export class FootballAdminService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
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
    let existingCountry = await this.countryModel.findOne({ name: countryName });
    if (existingCountry) return existingCountry;


    let newCountry = new this.countryModel({ name: countryName });
    try {
      await newCountry.save();
    } catch (e) {
      console.log('error', countryName);
    }
    return newCountry;
  }
}
