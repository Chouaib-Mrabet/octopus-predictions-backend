import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sport, SportSchema } from 'src/schemas/sport.schema';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }]),
  ],
  controllers: [SportsController],
  providers: [SportsService]
})
export class SportsModule {}
