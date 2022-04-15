import { User } from './../schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendUserConfirmation(user: User, token: string) {
    const url = process.env.APP_URL + '/auth/confirm/' + token;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Octupus Prediction Support Team" <noreply.octopus.prediction@gmail.com/>',
      subject: 'Welcome to Octupus Prediction! Confirm your Email',
      template: 'confirmation',
      context: {
        name: user.userName,
        url: url,
      },
    });
  }

  async sendResetConfirmation(user: User, token: string) {
    const url = process.env.APP_URL + '/auth/reset/confirm/' + token;
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Octupus Prediction Support Team" <noreply.octopus.prediction@gmail.com/>',
      subject: 'Octupus Prediction! Reset Password ',
      template: './confirmation',
      context: {
        name: user.userName,
        url: url,
      },
    });
  }
}
