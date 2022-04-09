import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Model } from 'mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';

@Injectable()
export class FootballService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
  ) {}

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find();
  }

  async getAllLeagues(): Promise<League[]> {
    return await this.leagueModel.find().populate('country').populate('sport');
  }

  async getLeaguesByCountry(countryName: string): Promise<League[]> {
    const country = await this.countryModel.findOne({ name: countryName });

    return await this.leagueModel.find({ country: country._id });
  }
}
