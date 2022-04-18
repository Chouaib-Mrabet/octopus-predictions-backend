import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Season } from './season.schema';
import { Team } from './team.schema';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
  @Prop({
    required: true,
    unique: true,
  })
  flashscoreId: string;

  @Prop({
    trim: true,
  })
  round: string;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Team.name,
    required: true,
  })
  @Type(() => Team)
  homeTeam: Team;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Team.name,
    required: true,
  })
  @Type(() => Team)
  awayTeam: Team;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Season.name,
  })
  @Type(() => Season)
  season: Season;

  @Prop({
    required: true,
  })
  finished: boolean;

  @Prop({
    required: true,
    type: [
      {
        time: { type: String, required: true },
        homeTeam: { type: Boolean, required: true },
      },
    ],
  })
  goals: any;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
