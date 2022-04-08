import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from './../auth/auth.service';
import { UserController } from './user.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
