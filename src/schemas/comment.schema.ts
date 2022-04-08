import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Game } from './game.schema';
import { User } from './user.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  @Type(() => User)
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Game.name,
    required: true,
  })
  @Type(() => Game)
  game: Game;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
