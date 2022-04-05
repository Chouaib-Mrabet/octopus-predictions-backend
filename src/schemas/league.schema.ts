import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

    //SportId
}

export const LeagueSchema = SchemaFactory.createForClass(League);