import { Game } from './game.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { Type } from 'class-transformer';

export type FavoriteGameDocument = FavoriteGame & Document;

@Schema({ timestamps: true })
export class FavoriteGame {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    @Type(() => User)
    user: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Game.name, required: true })
    @Type(() => Game)
    game: Game;

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const FavoriteGameSchema = SchemaFactory.createForClass(FavoriteGame);