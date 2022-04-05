import { Team } from './team.schema';
import { League } from './league.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { GameStateEnum } from 'src/enums/game-state.enum';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    @Prop({
        required: true,
        index: true,
        trim: true,
    })
    title: string;

    @Prop({
        required: true,
        index: true,
        unique: true,
        trim: true,
    })
    location: string;

    @Prop({
        required: true,
        enum: GameStateEnum,
        default: GameStateEnum.Scheduled
    })
    state: string;

    @Prop({
        index: true,
        unique: true,
        trim: true,
    })
    score: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: League.name })
    @Type(() => League)
    league: League;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Team.name })
    @Type(() => Team)
    team1: Team;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Team.name })
    @Type(() => Team)
    team2: Team;


    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);