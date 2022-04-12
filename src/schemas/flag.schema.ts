import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FlagDocument = Flag & Document;

@Schema({ timestamps: true })
export class Flag {
  @Prop()
  data: Buffer;

  @Prop({
    unique: true,
  })
  flashscoreId: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const Flagschema = SchemaFactory.createForClass(Flag);
