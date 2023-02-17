import { Injectable } from '@nestjs/common';
import { SendGridService } from '@anchan828/nest-sendgrid';
import { SendEmailParams } from '../products/dto/products.dto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';

// TODO: Use this in .env, or hardcode the template IDs in a different JSON file?
const RESET_PASSWORD_TEMPLATE_ID = 'd-c615b617f7164aa9ac93270be5d5fb27';

export interface SendResetPasswordEmailParams {
  to: string;
  username: string;
  resetUrl: string;
}

@Injectable()
export class SendgridEmailService {
  private readonly sender: string;

  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private sendGrid: SendGridService,
  ) {
    this.sender = this.configService.get<string>('SENDGRID_SENDER_EMAIL');
  }

  async sendEmail(params: SendEmailParams) {
    // 이 부분은 템플릿으로 변경하겠습니다!
    return await this.sendGrid.send(params);
  }

  async sendResetPasswordEmail(params: SendResetPasswordEmailParams) {
    const { to, username, resetUrl } = params;
    return await this.sendGrid.send({
      from: this.sender,
      to,
      templateId: RESET_PASSWORD_TEMPLATE_ID,
      dynamicTemplateData: { username, resetUrl },
    });
  }
}
