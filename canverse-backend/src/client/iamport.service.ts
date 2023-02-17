import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';
import * as Iamport from 'iamport';

type PaymentStatus = 'paid' | 'cancelled';

// Constructed from response from Iamport. There can be more fields
interface ImpPayment {
  imp_uid: string;
  merchant_uid: string;
  pg_provider: string;
  pay_method: string;
  status: PaymentStatus;
  currency: string;
  amount: number;
  receipt_url: string;
  paid_at: number; // Epoch in seconds

  custom_data: any;

  buyer_email: string;
  buyer_name: string;
  buyer_postcode: string;
  buyer_tel: string;

  cancel_amount: number;

  card_name: string;
  card_number: string; // partially redacted

  bank_code: string;
  bank_name: string;

  vbank_name: string;
}

@Injectable()
export class IamportService {
  private readonly client: Iamport;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.client = new Iamport({
      impKey: this.configService.get<string>('IAMPORT_KEY'),
      impSecret: this.configService.get<string>('IAMPORT_SECRET'),
    });
  }

  async getByImpUid(impUid: string): Promise<ImpPayment> {
    // Throws error if impUid is not found
    const response: ImpPayment = await this.client.payment.getByImpUid({
      imp_uid: impUid,
    });
    return response;
  }

  async cancelPayment(impUid: string): Promise<any> {
    const response = await this.client.payment.cancel({ imp_uid: impUid });
    return response;
  }
}
