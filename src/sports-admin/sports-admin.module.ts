import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sport, SportSchema } from 'src/schemas/sport.schema';
import { SportsAdminController } from './sports-admin.controller';
import { SportsAdminService } from './sports-admin.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }])
  ],
  controllers: [SportsAdminController],
  providers: [SportsAdminService]
})
export class SportsAdminModule {}
