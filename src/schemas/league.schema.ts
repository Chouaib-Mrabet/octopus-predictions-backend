import { Sport } from './sport.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
import { Country } from './country.schema';
import { Logo } from './logo.schema';

export type LeagueDocument = League & Document;

@Schema({ timestamps: true })
export class League extends Document {
  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  name: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Sport.name,required:true })
  @Type(() => Sport)
  sport: Sport;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Country.name,required:true })
  @Type(() => Country)
  country: Country;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Logo.name })
  logo: Logo;
}

export const LeagueSchema = SchemaFactory.createForClass(League);
