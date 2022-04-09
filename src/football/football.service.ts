import { Team, TeamDocument } from './../schemas/team.schema';
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
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
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

  async getLeaguesByCountries(): Promise<any[]> {
    const countries = await this.getCountries();

    let List = [];

    countries.forEach(async (ctr) => {
      const item = {
        country: ctr,
        leagues: await this.getLeaguesByCountry(ctr.name),
      };
      List.push(item);
    });

    return List;
  }

  async getTeamsByLeague(
    countryName: string,
    leagueName: string,
  ): Promise<Team[]> {
    const country = await this.countryModel.findOne({ name: countryName });

    const league = await this.leagueModel.find({
      name: leagueName,
      country: country._id,
    });

    return await this.teamModel.find({ league: league });
  }
}
