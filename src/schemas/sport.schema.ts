import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SportDocument = Sport & Document;

@Schema({ timestamps: true })
export class Sport {
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
}

export const SportSchema = SchemaFactory.createForClass(Sport);