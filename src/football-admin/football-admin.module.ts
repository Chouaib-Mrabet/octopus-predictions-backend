import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { Flag, Flagschema } from 'src/schemas/flag.schema';
import { League, LeagueSchema } from 'src/schemas/league.schema';
import { Logo, Logoschema } from 'src/schemas/logo.schema';
import { Sport, SportSchema } from 'src/schemas/sport.schema';
import { Team, TeamSchema } from 'src/schemas/team.schema';
import { FootballAdminController } from './football-admin.controller';
import { FootballAdminService } from './football-admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Logo.name, schema: Logoschema }]),
    MongooseModule.forFeature([{ name: Flag.name, schema: Flagschema }]),
  ],
  controllers: [FootballAdminController],
  providers: [FootballAdminService],
})
export class FootballAdminModule {}
