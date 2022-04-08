import { League } from './league.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { User } from './user.schema';

export type FavoriteLeagueDocument = FavoriteLeague & Document;

@Schema({ timestamps: true })
export class FavoriteLeague {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  @Type(() => User)
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: League.name,
    required: true,
  })
  @Type(() => League)
  league: League;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const FavoriteLeagueSchema =
  SchemaFactory.createForClass(FavoriteLeague);
