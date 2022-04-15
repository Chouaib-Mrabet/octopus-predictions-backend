import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FootballModule } from './football/football.module';
import { FootballAdminController } from './football-admin/football-admin.controller';
import { FootballAdminModule } from './football-admin/football-admin.module';
import { SportsAdminModule } from './sports-admin/sports-admin.module';
import { SportsModule } from './sports/sports.module';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    AuthModule,
    FootballModule,
    FootballAdminModule,
    SportsAdminModule,
    SportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
