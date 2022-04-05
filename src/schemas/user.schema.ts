import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Transform, Type } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop()
    userId: string;

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
    password: string;

    @Prop({
        required: true,
    })
    salt: string;

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
    createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);