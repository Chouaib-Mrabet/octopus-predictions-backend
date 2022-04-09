import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { League, LeagueSchema } from 'src/schemas/league.schema';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }])
  ],
  controllers: [FootballController],
  providers: [FootballService]
})
export class FootballModule {}
