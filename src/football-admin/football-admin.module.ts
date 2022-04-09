import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { League, LeagueSchema } from 'src/schemas/league.schema';
import { Sport, SportSchema } from 'src/schemas/sport.schema';
import { FootballAdminController } from './football-admin.controller';
import { FootballAdminService } from './football-admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }]),
  ],
  controllers: [FootballAdminController],
  providers: [FootballAdminService],
})
export class FootballAdminModule {}
