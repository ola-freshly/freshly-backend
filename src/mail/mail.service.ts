import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../classes/users/entities/user.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('MAIL_HOST'),
      auth: {
        user: config.get<string>('MAIL_USERNAME'),
        pass: config.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.config.get('APP_URL')}/auth/verify-email?token=${verificationToken}`;
    await this.transporter.sendMail({
      from: this.config.get<string>('MAIL_FROM_EMAIL'),
      to: user.email,
      subject: 'Verify your Freshly account',
      html: `
        <h1>Welcome to Freshly, ${user.name}!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    });
  }
}
