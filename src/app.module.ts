import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot("mongodb+srv://user:mqwkzUkwQEFlaUTj@octopuspredictions.czilc.mongodb.net/OctopusPredictions?retryWrites=true&w=majorityAPP_PORT = 3000")],
  controllers: [
    UserController, AppController],
  providers: [AppService],
})
export class AppModule { }
