import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

    // @Prop({
    //     required: true,
    //     enum: StateEnum,
    //     default: StateEnum.smth
    // })
    // state: string;

    @Prop({
        index: true,
        unique: true,
        trim: true,
    })
    score: string;

    // Team1Id
    // Team1Id
    // LeagueId

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);