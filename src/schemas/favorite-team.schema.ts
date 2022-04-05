import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteTeamDocument = FavoriteTeam & Document;

@Schema({ timestamps: true })
export class FavoriteTeam {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    // UserId
    // TeamId

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const FavoriteTeamSchema = SchemaFactory.createForClass(FavoriteTeam);