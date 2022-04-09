import { League } from './league.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  country: string;

  @Prop({
    trim: true,
  })
  squad: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: League.name })
  @Type(() => League)
  league: League;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
