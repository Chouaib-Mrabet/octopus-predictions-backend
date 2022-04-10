import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LogoDocument = Logo & Document;

@Schema({ timestamps: true })
export class Logo {
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

export const Logoschema = SchemaFactory.createForClass(Logo);
