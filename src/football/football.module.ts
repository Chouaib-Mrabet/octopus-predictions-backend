import { Game, GameSchema } from './../schemas/game.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { League, LeagueSchema } from 'src/schemas/league.schema';
import { Team, TeamSchema } from 'src/schemas/team.schema';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  controllers: [FootballController],
  providers: [FootballService],
})
export class FootballModule {}
