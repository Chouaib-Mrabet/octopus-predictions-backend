import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.freesmtpservers.com',
          port: 25,
          secure: false,
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../../src/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
  ],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
