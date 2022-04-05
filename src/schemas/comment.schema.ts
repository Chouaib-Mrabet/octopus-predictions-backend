import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
    })
    content: string;

    // UserId
    // GameId

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);