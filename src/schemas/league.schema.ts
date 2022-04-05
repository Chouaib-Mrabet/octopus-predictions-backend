import { Sport } from './sport.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';

export type LeagueDocument = League & Document;

@Schema({ timestamps: true })
export class League {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

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

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Sport.name })
    @Type(() => Sport)
    sport: Sport;

}

export const LeagueSchema = SchemaFactory.createForClass(League);