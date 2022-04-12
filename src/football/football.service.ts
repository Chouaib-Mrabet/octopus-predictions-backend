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

@Injectable()
export class FootballService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(FavoriteGame.name)
    private favoriteGameModel: Model<FavoriteGameDocument>,
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

    for (let i = 0; i < countries.length; i++) {
      let item = {
        country: countries[i],
        leagues: await this.getLeaguesByCountry(countries[i].name),
      };
      List.push(item);
    }

    return List;
  }

  async getTeamsByCountry(countryName: string): Promise<Team[]> {
    const country = await this.countryModel.findOne({ name: countryName });

    const teams = await this.teamModel.find({ country: country._id });

    console.log(teams);

    return teams;
  }

  async getGamesByLeague(
    countryName: string,
    leagueName: string,
  ): Promise<any[]> {
    const country = await this.countryModel.findOne({ name: countryName });

    const league = await this.leagueModel.find({
      name: leagueName,
      country: country._id,
    });

    return await this.gameModel
      .find({ league: league })
      .populate('team1')
      .populate('team2');
  }

  // No favorites Games for now
  // async getFavoriteGames(user: User): Promise<Game[]> {
  //   let List = await this.favoriteGameModel.find({ user: user });
  //   let favoriteGames = [];

  //   for (let index in List) {
  //     let game = await this.gameModel
  //       .findOne({ game: List[index] })
  //       .populate('game');

  //     favoriteGames.push(game);
  //   }

  //   return favoriteGames;
  // }
}
