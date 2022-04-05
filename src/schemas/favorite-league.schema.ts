import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteLeagueDocument = FavoriteLeague & Document;

@Schema({ timestamps: true })
export class FavoriteLeague {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    // UserId
    // LeagueId

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const FavoriteLeagueSchema = SchemaFactory.createForClass(FavoriteLeague);