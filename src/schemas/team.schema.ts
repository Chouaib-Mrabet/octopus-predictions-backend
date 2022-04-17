import { Country } from './country.schema';
import { League } from './league.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Logo } from './logo.schema';
import { Sport } from './sport.schema';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true, autoIndex: true })
export class Team {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Sport.name,
    required: true,
  })
  @Type(() => Sport)
  sport: Sport;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Country.name,
    required: true,
  })
  @Type(() => Country)
  country: Country;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Logo.name })
  logo: Logo;

  @Prop({
    required: true,
  })
  flashscoreId: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

TeamSchema.index({ name: 1, flashscoreId: 1 }, { unique: true });
