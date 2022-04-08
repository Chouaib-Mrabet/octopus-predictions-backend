import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sport, SportDocument } from 'src/schemas/sport.schema';
import { Model } from 'mongoose';

@Injectable()
export class SportsService {

    constructor(
        @InjectModel(Sport.name) private sportModel: Model<SportDocument>
      ) {}

      async getSports(): Promise<Sport[]> {
        return await this.sportModel.find()
      }
}
