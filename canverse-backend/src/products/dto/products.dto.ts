import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { stringify } from 'querystring';
export class GetProductInfoParams {
  id!: string;
}

export class GetPurchaseHistoriesParams {
  id!: string;
}
export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;

  // Only need one of these
  text?: string;
  html?: string;
  templateId?: string;
}
//export class CreateProductDto{}

export class PurchaseProductDto {
  @IsString()
  imp_uid: string;

  @IsString()
  merchant_uid: string;

  @IsString()
  @IsOptional()
  imp_success?: string;

  @IsString()
  @IsOptional()
  success?: string;
}

export class ProductUploadDto {
  @IsString()
  author_name: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  producedyear: string;

  @IsString()
  @IsOptional()
  material: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cmheight: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cmwidth: number;

  @IsNumber()
  @Type(() => Number)
  pxheight: number;

  @IsNumber()
  @Type(() => Number)
  pxwidth: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  reserve_price: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  author_birth?: string;

  @IsString()
  @IsOptional()
  author_country?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_pyhsical_artwork?: boolean;

  // @IsBoolean()
  // send_physical_artwork!: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  send_physical_rightaway?: boolean;

  @IsString()
  @IsOptional()
  send_physical_rightaway_reason?: string;

  @IsString()
  @IsOptional()
  send_physical_rightaway_date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  physical_reserve_price?: number;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
}

export class PurchaseProductPaypal {
  @IsString()
  buyer: string;

  @IsString()
  product: string;

  @IsString()
  exhibition: string;

  @IsString()
  currency: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;
}

export class UploadFilePinata {
  @IsString()
  readableStream: string;

  @IsString()
  pinataMetadata: {
    name: string;
  };
  // 현재 캔버스에서는 Options를 null 객체로 넘겨서 사용하고 있습니다.
  @IsString()
  pinataOptions: null;
}
