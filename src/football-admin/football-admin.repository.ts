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

    await newLeague.save();

    return newLeague;
  }

  async getCountries(): Promise<Country[]> {
    return await this.countryModel.find();
  }

  async getLeagues(): Promise<League[]> {
    return (await this.leagueModel.find().populate('country')).splice(159,10);
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
    let logoUrl = `https://www.flashscore.com/res/image/data/${logoFlashscoreId}.png`;
    logo.data = Buffer.from(
      (await axios.get(logoUrl, { responseType: 'arraybuffer' })).data,
      'utf-8',
    );
    await logo.save();

    return logo;
  }

  async findElseSaveFinishedSeason(
    league: League,
    seasonName: string,
    winnerFlashscoreId: string,
    winnerName: string,
  ): Promise<Season> {
    let winner: Team = await this.teamModel.findOne({
      name: winnerName,
      flashscoreId: winnerFlashscoreId,
    });
    if (winner == null) {
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

    let finishedSeason = new this.seasonModel({
      name: seasonName,
      league: league,
      winner: winner,
    });
    try {
      await finishedSeason.save();
    } catch (error) {
      console.log(error, finishedSeason);
    }
    return finishedSeason;
  }
}
