

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

const fs = require('fs');

@Injectable()
export class EmailNotificationService {
  constructor(private readonly mailerService: MailerService) {}

  from: string = 'no-reply@climatesi.com';

  async sendMail(
    to: string[],
    subject: string,
    text: string,
    emailTemplate: string = '',
  ):Promise<any> {
   await this.mailerService
      .sendMail({
        to: to, //user.email, // list of receivers
        from: this.from, // sender address
        subject: subject, // Subject line
        text: text, // plaintext body
        html: emailTemplate, // HTML body content
      })
      .then((res) => {
        // console.log('email sent sent ===============', res.accepted[0]);
      return  res.accepted[0];
      
      })
      .catch((e) => {
        
        // console.log('email error =====================', e);
        throw Error (e)
      });
  }

}
