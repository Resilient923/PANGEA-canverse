import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';
import { App } from '@slack/bolt';

@Injectable()
export class SlackService {
  private readonly slack;
  private readonly purchaseAlertChannelId;
  private readonly currentTime;
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    private readonly logger: Logger,
  ) {
    this.slack = new App({
      token: configService.get<string>('SLACK_BOT_TOKEN'),
      signingSecret: configService.get<string>('SLACK_SIGNING_SECRET'),
      socketMode: true, // add this
      appToken: configService.get<string>('SLACK_APP_TOKEN'),
    });
    this.purchaseAlertChannelId = configService.get<string>(
      'SLACK_PURCHASE_ALERT_CHANNEL_ID',
    );
    this.currentTime = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
  }
  async purchaseProductAlert(buyer, seller, product, product_id) {
    const message = `'${buyer}' 님이 '${seller}' 님의  '${product}' 작품을 구매했습니다!`;
    try {
      this.slack.client.chat.postMessage({
        channel: this.purchaseAlertChannelId,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `구매시각 : ${this.currentTime}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `작품상세페이지 : https://canverse.org/products/${product_id}`,
            },
          },
        ],
      });
    } catch (err) {
      this.logger.log('Slack bot Error', err);
    }
  }

  async purchaseEditionAlert(buyer, seller, product, edition_id, product_id) {
    const message = `'${buyer}' 님이 '${seller}' 님의  '${product}' 작품의 ${edition_id}번째 에디션을 구매했습니다!`;
    try {
      this.slack.client.chat.postMessage({
        channel: this.purchaseAlertChannelId,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `구매시각 : ${this.currentTime}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `작품 에디션 상세페이지 : https://canverse.org/products/${product_id}`,
            },
          },
        ],
      });
    } catch (err) {
      this.logger.log('Slack bot Error', err);
    }
  }
}
