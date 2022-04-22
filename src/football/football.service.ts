import { Season, SeasonDocument } from './../schemas/season.schema';
import { Match, MatchDocument } from 'src/schemas/match.schema';
import { Team, TeamDocument } from './../schemas/team.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Model } from 'mongoose';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Flag, FlagDocument } from 'src/schemas/flag.schema';

@Injectable()
export class FootballService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(Flag.name) private flagModel: Model<FlagDocument>,

    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Logo.name) private logoModel: Model<LogoDocument>,
  ) {}

  async getCountryById(id: string): Promise<Country> {
    return await this.countryModel.findOne({ _id: id });
  }

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find();
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

  async getMatchById(id: string): Promise<Match> {
    let match = this.matchModel.findOne({ _id: id });

    return match;
  }

  async getMatches(
    documentsToSkip = 0,
    limitOfDocuments?: number,
  ): Promise<any> {
    if (limitOfDocuments) {
      const findQuery = this.matchModel
        .find()
        .skip(documentsToSkip)
        .populate('homeTeam')
        .populate('awayTeam')
        .limit(limitOfDocuments);

      const data = await findQuery;
      const totalItems = await this.matchModel.count();
      const itemCount = data.length;

      return { data, totalItems, itemCount };
    } else {
      const findQuery = this.matchModel
        .find()
        .skip(documentsToSkip)
        .populate('homeTeam')
        .populate('awayTeam');

      const data = await findQuery;
      const totalItems = await this.matchModel.count();
      const itemCount = data.length;

      return { data, totalItems, itemCount };
    }
  }

  async getMatchesBySeason(seasonId: string): Promise<Match[]> {
    let matches = await this.matchModel.find({ season: seasonId });

    return matches;
  }

  async getSeasonsByLeague(leagueId: string): Promise<Season[]> {
    let seasons = await this.seasonModel.find({ league: leagueId });

    return seasons;
  }

  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    let matches = await this.matchModel.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
    });

    return matches;
  }

  async getMatchesBySeasonAndTeam(
    seasonId: string,
    teamId: string,
  ): Promise<Match[]> {
    let matches = await this.matchModel
      .find({
        season: seasonId,
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
      })
      .populate('homeTeam')
      .populate('awayTeam');
    return matches;
  }

  async getLeaguesByTeamId(teamId: string): Promise<League[]> {
    console.time('getLeaguesByTeamId');
    let matches = await this.matchModel
      .find({
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
      })
      .populate({ path: 'season', populate: { path: 'league' } });
    let leagues = [];

    for (let i = 0; i < matches.length; i++) {
      let newLeague = matches[i].season.league;
      if (leagues.findIndex((league) => league._id === newLeague._id) == -1) {
        leagues.push(newLeague);
      }
    }

    console.timeEnd('getLeaguesByTeamId');

    return leagues;
  }
}
