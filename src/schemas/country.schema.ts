import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Flag } from './flag.schema';

export type CountryDocument = Country & Document;

@Schema({ timestamps: true })
export class Country {
  @Prop({
    required: true,
    index: true,
    trim: true,
    unique: true,
  })
  name: string;


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Flag.name })
  flag: Flag;


  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
