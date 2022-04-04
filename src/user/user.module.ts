import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule { }
