import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot("mongodb+srv://user:mqwkzUkwQEFlaUTj@octopuspredictions.czilc.mongodb.net/OctopusPredictions?retryWrites=true",
      {
        autoIndex: true,
      })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
