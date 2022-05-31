import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from 'src/schemas/country.schema';
import { Model } from 'mongoose';
import { FootballAdminService } from './football-admin.service';
import { Flag, FlagDocument } from 'src/schemas/flag.schema';
import { League, LeagueDocument } from 'src/schemas/league.schema';
import { Team, TeamDocument } from 'src/schemas/team.schema';
import { Sport, SportDocument } from 'src/schemas/sport.schema';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Season, SeasonDocument } from 'src/schemas/season.schema';
import { Match, MatchDocument } from 'src/schemas/match.schema';
const axios = require('axios').default;

@Injectable()
export class FootballAdminRepository {
  constructor(
    @Inject(forwardRef(() => FootballAdminService))
    private readonly footballAdminService: FootballAdminService,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(Flag.name) private flagModel: Model<FlagDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
    @InjectModel(Logo.name) private logoModel: Model<LogoDocument>,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async findElseSaveCountries(countriesNames: string[]): Promise<Country[]> {
    let countries: Country[] = [];
    let maximumParallelCalls = 20;

    let i = 0;
    let j = 0;
    let parallelSaving: Promise<Country>[] = [];
    while (i < countriesNames.length) {
      j = i;
      parallelSaving = [];
      while (j < countriesNames.length && j - i < maximumParallelCalls) {
        parallelSaving.push(this.findElseSaveCountry(countriesNames[j]));
        j++;
      }
      i = j;
      await Promise.all(parallelSaving).then((values) =>
        countries.push(...values),
      );
    }

    return countries;
  }

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

  async findElseSaveLeague(
    leagueName: string,
    country: Country,
    logoFlashscoreId: string,
  ): Promise<League> {
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
    newLeague.logo = await this.findElseSaveLogo(logoFlashscoreId);

    await newLeague.save();

    return newLeague;
  }

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find();
  }

  async getLeagues(): Promise<League[]> {
    return await this.leagueModel.find().populate('country');
  }
  async getLeague(leagueId: string): Promise<League> {
    return await this.leagueModel
      .findOne({ _id: leagueId })
      .populate('country');
  }

  async getTeams(): Promise<Team[]> {
    return await this.teamModel.find().populate('logo');
  }

  async findElseSaveTeam(
    teamName: string,
    teamFlashscoreId: string,
    countryName: string,
    logoFlashscoreId: string,
  ): Promise<Team> {
    let team = await this.teamModel.findOne({
      name: teamName,
      flashscoreId: teamFlashscoreId,
    });

    if (team) return team;

    let country = await this.findElseSaveCountry(countryName);
    let logo = await this.findElseSaveLogo(logoFlashscoreId);
    let football = await this.sportModel.findOne({ name: 'football' });
    team = new this.teamModel({
      name: teamName,
      sport: football,
      flashscoreId: teamFlashscoreId,
      logo: logo,
      country: country,
    });

    await team.save();
    console.log('saving : ' + teamName);

    return team;
  }

  async findElseSaveLogo(logoFlashscoreId: string): Promise<Logo> {
    let existingLogo = await this.logoModel.findOne({
      flashscoreId: logoFlashscoreId,
    });
    if (existingLogo) return existingLogo;

    let logo = new this.logoModel({ flashscoreId: logoFlashscoreId });
    let logoUrl: string;
    if (logoFlashscoreId != null)
      logoUrl = `https://www.flashscore.com/res/image/data/${logoFlashscoreId}.png`;
    else
      logoUrl =
        'https://www.flashscore.com/res/image/empty-logo-team-share.gif';
    try {
      logo.data = Buffer.from(
        (await axios.get(logoUrl, { responseType: 'arraybuffer' })).data,
        'utf-8',
      );
    } catch (err) {
      console.log(err);
      logo.data = Buffer.from(
        (
          await axios.get(
            'https://www.flashscore.com/res/image/empty-logo-team-share.gif',
            { responseType: 'arraybuffer' },
          )
        ).data,
        'utf-8',
      );
    }
    await logo.save();

    return logo;
  }

  async findElseSaveSeason(
    league: League,
    seasonName: string,
    winnerFlashscoreId: string,
    winnerName: string,
    finished: boolean,
  ): Promise<Season> {
    try {
      let winner: Team = await this.teamModel.findOne({
        name: winnerName,
        flashscoreId: winnerFlashscoreId,
      });
      if (winner == null && winnerFlashscoreId != null && winnerName != null) {
        let winnerInfo = await this.footballAdminService.scrapeTeamInfo(
          winnerName,
          winnerFlashscoreId,
        );
        winner = await this.findElseSaveTeam(
          winnerInfo.teamName,
          winnerInfo.teamFlashscoreId,
          winnerInfo.countryName,
          winnerInfo.logoFlashscoreId,
        );
      }
      let existingSeason = await this.seasonModel.findOne({
        name: seasonName,
        league: league,
      });

      if (existingSeason) return existingSeason;

      let newSeason = new this.seasonModel({
        name: seasonName,
        finished: finished,
        league: league,
        winner: winner,
      });
      await newSeason.save();
      return newSeason;
    } catch (error) {
      console.log(error, seasonName);
      return null;
    }
  }
  async findElseSaveMatch(
    flagFlashscoreId: string,
    round: string,
    dateTimeMs: number,
    homeTeamIds: {
      teamName: string;
      teamFlashscoreId: string;
    },
    awayTeamIds: {
      teamName: string;
      teamFlashscoreId: string;
    },
    goals: {
      time: string;
      homeTeam: boolean;
    }[],
    season: Season,
    finished: boolean,
  ): Promise<Match> {
    let existingMatch = await this.matchModel.findOne({
      flashscoreId: flagFlashscoreId,
    });
    if (existingMatch) return existingMatch;

    let homeTeam: Team = await this.teamModel.findOne({
      name: homeTeamIds.teamName,
      flashscoreId: homeTeamIds.teamFlashscoreId,
    });
    if (homeTeam == null) {
      let teamInfo = await this.footballAdminService.scrapeTeamInfo(
        homeTeamIds.teamName,
        homeTeamIds.teamFlashscoreId,
      );
      homeTeam = await this.findElseSaveTeam(
        teamInfo.teamName,
        teamInfo.teamFlashscoreId,
        teamInfo.countryName,
        teamInfo.logoFlashscoreId,
      );
    }

    let awayTeam: Team = await this.teamModel.findOne({
      name: awayTeamIds.teamName,
      flashscoreId: awayTeamIds.teamFlashscoreId,
    });
    if (awayTeam == null) {
      let teamInfo = await this.footballAdminService.scrapeTeamInfo(
        awayTeamIds.teamName,
        awayTeamIds.teamFlashscoreId,
      );
      awayTeam = await this.findElseSaveTeam(
        teamInfo.teamName,
        teamInfo.teamFlashscoreId,
        teamInfo.countryName,
        teamInfo.logoFlashscoreId,
      );
    }

    let newMatch = new this.matchModel({
      flashscoreId: flagFlashscoreId,
      round: round,
      date: dateTimeMs,
      goals: goals,
      season: season,
      finished: finished,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
    });

    return await newMatch.save();
  }

  async getOutdatedMatches(): Promise<Match[]> {
    return await this.matchModel.find({
      finished: false,
      date: { $lt: new Date().getTime() },
    });
  }

  async updateOutdatedMatch(matchId, goals, finished) {
    let match = await this.matchModel.findOne({ _id: matchId });
    match.goals = goals;
    match.finished = finished;
    await match.save()
  }
}
