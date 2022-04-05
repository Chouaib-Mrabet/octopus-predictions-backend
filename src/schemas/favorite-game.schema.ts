import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteGameDocument = FavoriteGame & Document;

@Schema({ timestamps: true })
export class FavoriteGame {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    // UserId
    // GameId

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const FavoriteGameSchema = SchemaFactory.createForClass(FavoriteGame);