import { Season, Seasonschema } from './../schemas/season.schema';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { Game, GameSchema } from './../schemas/game.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { Flag, Flagschema } from 'src/schemas/flag.schema';
import { League, LeagueSchema } from 'src/schemas/league.schema';
import { Logo, Logoschema } from 'src/schemas/logo.schema';
import { Team, TeamSchema } from 'src/schemas/team.schema';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import {
  FavoriteGame,
  FavoriteGameSchema,
} from 'src/schemas/favorite-game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Logo.name, schema: Logoschema }]),
    MongooseModule.forFeature([{ name: Flag.name, schema: Flagschema }]),
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    MongooseModule.forFeature([{ name: Season.name, schema: Seasonschema }]),

    MongooseModule.forFeature([
      { name: FavoriteGame.name, schema: FavoriteGameSchema },
    ]),
  ],
  controllers: [FootballController],
  providers: [FootballService],
})
export class FootballModule {}
