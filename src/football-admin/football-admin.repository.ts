import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Model } from 'mongoose';
import { FootballAdminService } from './football-admin.service';
import { Flag, FlagDocument } from 'src/schemas/flag.schema';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Team, TeamDocument } from 'src/schemas/team.schema';
const axios = require('axios').default;

@Injectable()
export class FootballAdminRespository {
  constructor(
    @Inject(forwardRef(() => FootballAdminService))
    private readonly footballAdminService: FootballAdminService,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(Flag.name) private flagModel: Model<FlagDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async findElseSaveCountry(countryName: string): Promise<Country> {
    let existingCountry = await this.countryModel.findOne({
      name: countryName,
    });
    if (existingCountry) return existingCountry;

    let flagFlashscoreId = await this.footballAdminService.scrapeCountryFlag(
      countryName,
    );

    let flag = await this.findElseSaveFlag(flagFlashscoreId);

    let newCountry = new this.countryModel({ name: countryName, flag: flag });

    await newCountry.save();
    return newCountry;
  }

  async findElseSaveFlag(flagFlashscoreId: string): Promise<Flag> {
    let flag = await this.flagModel.findOne({
      flashscoreId: flagFlashscoreId,
    });
    if (flag == null) {
      flag = new this.flagModel({ flashscoreId: flagFlashscoreId });
      let flagUrl = `https://www.flashscore.com/res/_fs/build/${flagFlashscoreId}.png`;
      flag.data = Buffer.from(
        (await axios.get(flagUrl, { responseType: 'arraybuffer' })).data,
        'utf-8',
      );
      await flag.save();
    }
    return flag;
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
}
