import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);