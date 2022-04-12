import {
  FavoriteGame,
  FavoriteGameDocument,
} from './../schemas/favorite-game.schema';
import { User } from './../schemas/user.schema';
import { Game, GameDocument } from './../schemas/game.schema';
import { Team, TeamDocument } from './../schemas/team.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Model } from 'mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Flag, FlagDocument } from 'src/schemas/flag.schema';
import { count } from 'console';

@Injectable()
export class FootballService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Logo.name) private logoModel: Model<LogoDocument>,
    @InjectModel(Flag.name) private flagModel: Model<FlagDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(FavoriteGame.name)
    private favoriteGameModel: Model<FavoriteGameDocument>,
  ) {}

  async getCountryById(id: string): Promise<Country> {
    return await this.countryModel.findOne({ _id: id }).populate('flag');
  }

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find().populate('flag');
  }

  async getLeagueById(id: string): Promise<League[]> {
    return await this.leagueModel
      .findOne({ _id: id })
      .populate('country')
      .populate('sport');
  }

  async getLeagues(): Promise<League[]> {
    return await this.leagueModel.find().populate('country').populate('sport');
  }

  async getLeaguesByCountry(countryId: string): Promise<League[]> {
    const country = await this.countryModel.findOne({ _id: countryId });

    return await this.leagueModel.find({ country: country._id });
  }

  async getLeaguesByCountries(): Promise<any[]> {
    const countries = await this.getCountries();

    let List = [];

    for (let i = 0; i < countries.length; i++) {
      let item = {
        country: countries[i],
        leagues: await this.getLeaguesByCountry(countries[i].name),
      };
      List.push(item);
    }

    return List;
  }

  async getTeamById(id: string): Promise<Team> {
    return await this.teamModel
      .findOne({ _id: id })
      .populate('country')
      .populate('sport');
  }

  async getTeamsByCountry(countryId: string): Promise<Team[]> {
    const teams = await this.teamModel.find({ country: countryId });

    return teams;
  }

  async getTeams(): Promise<Team[]> {
    return await this.teamModel.find();
  }

  async getLogo(id: string): Promise<Logo> {
    return await this.logoModel.findOne({ _id: id });
  }

  async getFlag(id: string): Promise<Flag> {
    return await this.flagModel.findOne({ _id: id });
  }

  async getGamesByLeague(leagueId: string): Promise<any[]> {
    return await this.gameModel
      .find({ league: leagueId })
      .populate('team1')
      .populate('team2');
  }
}
