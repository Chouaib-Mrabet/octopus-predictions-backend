import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])
  ],
  controllers: [FootballController],
  providers: [FootballService]
})
export class FootballModule {}
