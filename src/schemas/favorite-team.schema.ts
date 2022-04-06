import { Team } from './team.schema';
import { User } from 'src/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

export type FavoriteTeamDocument = FavoriteTeam & Document;

@Schema({ timestamps: true })
export class FavoriteTeam {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    @Type(() => User)
    user: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Team.name, required: true })
    @Type(() => Team)
    team: Team;

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const FavoriteTeamSchema = SchemaFactory.createForClass(FavoriteTeam);