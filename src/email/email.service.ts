import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.envService.get('MAIL_HOST'),
      port: parseInt(this.envService.get('MAIL_PORT'), 10),
      secure: true,
      auth: {
        user: this.envService.get('MAIL_USER'),
        pass: this.envService.get('MAIL_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, content: string) {
    const mailOptions = {
      from: `"No Reply" <${this.envService.get('MAIL_USER')}>`,
      to,
      subject,
      text: content,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
