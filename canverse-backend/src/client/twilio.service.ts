import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { EnvironmentVariables } from 'src/common/types';

@Injectable()
export class TwilioService {
  readonly senderNumber: string;

  public constructor(
    @InjectTwilio() private readonly twilioclient: TwilioClient,
    private configService: ConfigService<EnvironmentVariables>,
  ) {
    this.senderNumber = this.configService.get<string>('TWILIO_SENDER_NUMBER');
  }

  async sendVerificationSMS(phoneNumber: string, code: string) {
    const message = await this.twilioclient.messages.create({
      // TODO: localization of the message
      body: `[Canverse] Your verification code is [${code}]`,
      to: phoneNumber,
      from: this.senderNumber,
    });
    return message;
  }
}
