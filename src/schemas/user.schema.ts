import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRoleEnum } from 'src/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        index: true,
        trim: true,
    })
    userName: string;

    @Prop({
        required: true,
        index: true,
        unique: true,
        trim: true,
    })
    email: string;

    @Prop({
        index: true,
        unique: true,
        trim: true,
    })
    mobileNumber: string;

    @Prop({
        required: true,
    })
    hashedPassword: string;


    @Prop({
        required: true,
        enum: UserRoleEnum,
        default: UserRoleEnum.USER
    })
    role: string;

    @Prop({
        required: true,
        default: false
    })
    verified: boolean;

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);