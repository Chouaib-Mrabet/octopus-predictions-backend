import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { League } from './league.schema';
import { Team } from './team.schema';

export type SeasonDocument = Season & Document;

@Schema({ timestamps: true })
export class Season {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: League.name,
  })
  @Type(() => League)
  league: League;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  @Type(() => Team)
  winner: Team;
}



export const Seasonschema = SchemaFactory.createForClass(Season);

Seasonschema.index({name:1,league:1},{unique:true})
