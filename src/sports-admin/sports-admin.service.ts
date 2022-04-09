import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sport, SportDocument } from 'src/schemas/sport.schema';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer-core';

@Injectable()
export class SportsAdminService {
  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
  ) {}

  async scrapeSports(): Promise<string[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    const page = await browser.newPage();

    let url = 'https://www.flashscore.com/';
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    let sportsNames = [];
    sportsNames.push(
      ...(await page.$$eval('a.menuTop__item', (elements) => {
        return elements
          .map((element) => element.getAttribute('href').replace(/\//g, ''))
          .filter((text) => text != 'favorites');
      })),
    );
    sportsNames.push(
      ...(await page.$$eval('a.menuMinority__item', (elements) => {
        return elements.map((element) =>
          element.getAttribute('href').replace(/\//g, ''),
        );
      })),
    );

    await browser.close();
    return sportsNames.filter((name) => name != '');
  }

  async saveSport(sportName: string): Promise<Sport> {
    let sport = new this.sportModel({ name: sportName });
    try {
      await sport.save();
    } catch (e) {
      console.log('error', sportName);
    }
    return sport;
  }
}
