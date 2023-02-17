import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { SaleItem } from 'src/saleitems/entities/saleitems.entity';
import { Exhibition } from '../../exhibitions/entities/exhibition.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

export enum ProductStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  TO_UPDATE = 'TO_UPDATE',
  UPDATED = 'UPDATED',
  SIGNED = 'SIGNED',
  SOLD_OUT = 'SOLD_OUT',
  FINISHED = 'FINISHED',
}

export enum NftStatus {
  MINT_NOT_NEEDED = 'MINT_NOT_NEEDED',
  MINT_NOT_STARTED = 'MINT_NOT_STARTED',
  MINT_STARTED = 'MINT_STARTED',
  MINT_FAILED = 'MINT_FAILED',
  MINT_COMPLETE = 'MINT_COMPLETE',
  APPROVE_STARTED = 'APPROVE_STARTED',
  APPROVE_FAILED = 'APPROVE_FAILED',
  APPROVED = 'APPROVED',
}

export enum SaleType {
  AUCTION = 'AUCTION',
  FIXED_PRICE_FIAT_UNIQUE = 'FIXED_PRICE_FIAT_UNIQUE',
  FIXED_PRICE_FIAT = 'FIXED_PRICE_FIAT',
}

export enum ProductType {
  UNIQUE = 'UNIQUE',
  CONTAINER = 'CONTAINER',
  EDITION = 'EDITION',
}

export enum SupportedCurrency {
  KRW = 'KRW',
  USD = 'USD',
}

export enum CryptoNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
}

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, type: ObjectId, ref: 'User' })
  user!: User;

  @Prop({ type: ObjectId, ref: 'Exhibition' })
  exhibition?: Exhibition;

  @Prop({ type: ObjectId, ref: 'SaleItem' })
  auction_product!: SaleItem;

  @Prop({
    type: String,
    required: true,
    enum: Object.keys(ProductStatus),
    default: ProductStatus.CREATED,
  })
  status!: ProductStatus;

  @Prop()
  cmheight: number;

  @Prop()
  cmwidth: number;

  @Prop()
  pxheight: number;

  @Prop()
  pxwidth: number;

  @Prop()
  size: string;

  @Prop()
  material: string;

  @Prop()
  title!: string;

  @Prop()
  description!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.keys(SaleType),
  })
  saleType!: SaleType;

  @Prop()
  producedyear: string;

  @Prop({
    type: Number,
    integer: true,
    default: 0,
  })
  user_likes: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.keys(ProductType),
  })
  productType!: ProductType;

  @Prop({ type: ObjectId, ref: 'Product' })
  mainProduct: Product;

  @Prop({ type: Number, integer: true })
  editionNumber: number;

  @Prop({ type: Number, integer: true, default: 0 })
  purchaseCount!: number;

  @Prop({ type: Number, integer: true, default: 1 })
  totalQuantity!: number;

  // Uploaded original file related fields
  @Prop()
  file_img_name: string; // Name of the original file. Can contain "/" if uploaded to a cloud storage service.
  @Prop()
  file_img_path: string; // Path of the original file, local filepath or external storage service path.
  @Prop()
  file_ipfs_cid: string; // CID when the file is uploaded in IPFS
  @Prop()
  file_ipfs_url: string; // URL of this product in IPFS. Should be https://ipfs.io/ipfs/${file_ipfs_cid}

  // Thumbnail file related fields
  @Prop()
  thumb_img_name: string; // Name of the thumbnail file. Can contain "/" if uploaded to a cloud storage service.
  @Prop()
  thumb_img_path: string; // Path of the thumbnail file, local filepath or external storage service path.

  // Video thumbnail related fields
  @Prop()
  videoThumbnailName: string; // Name of the video thumbnail file. Can contain "/" if uploaded to a cloud storage service.
  @Prop()
  videoThumbnailPath: string; // Path of the video thumbnail file, local filepath or external storage service path.

  // Metadata JSON file related fields
  @Prop()
  metadata_file_ipfs_cid: string; // CID when the file is uploaded in IPFS
  // URL of this metadat JSON file in IPFS. Should be https://ipfs.io/ipfs/${metadata_file_ipfs_cid}
  @Prop()
  metadata_file_ipfs_url: string;

  // NFT related fields
  @Prop()
  nft_contract_address: string;
  @Prop()
  nft_mint_transaction_hash: string;
  @Prop({ type: Object })
  nft_mint_transaction!: Object;
  //@Prop()
  //nft_approve_transaction_hash: String,
  //@Prop()
  //nft_approve_transaction: Object,
  @Prop()
  nft_token_id: string; // This is auto-incremented number, but we'll store as string as an additional safeguard.
  // NFT token ID is assigned when minting begins. We should later update the status if minting is successful.
  @Prop({
    type: String,
    enum: Object.keys(NftStatus),
    default: NftStatus.MINT_NOT_STARTED,
  })
  nft_status!: NftStatus;

  @Prop()
  is_pyhsical_artwork: boolean;

  @Prop()
  send_physical_artwork!: boolean;

  @Prop()
  send_physical_rightaway: boolean;

  @Prop()
  send_physical_rightaway_reason?: string;

  @Prop()
  send_physical_rightaway_date?: string;

  @Prop()
  physical_reserve_price?: number;

  @Prop()
  reserve_price: number;

  @Prop()
  reserve_price2: number;

  @Prop()
  author_name?: string;
  @Prop()
  author_birth?: string;
  @Prop()
  author_country?: string;
  @Prop()
  additionalInfo?: string;

  @Prop({
    type: String,
    enum: Object.keys(SupportedCurrency),
    default: SupportedCurrency.KRW,
  })
  currency: SupportedCurrency;

  @Prop({
    type: String,
    enum: Object.keys(CryptoNetwork),
    default: CryptoNetwork.POLYGON,
  })
  cryptoNetwork!: CryptoNetwork;

  @Prop()
  cryptoPrice!: number;

  @Prop({
    type: String,
    enum: Object.keys(SupportedCurrency),
    default: SupportedCurrency.USD,
  })
  currency2!: SupportedCurrency;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
