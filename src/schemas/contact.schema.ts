import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({
    trim: true,
  })
  name: string;

  @Prop({
    trim: true,
  })
  email: string;

  @Prop({
    trim: true,
  })
  message: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
