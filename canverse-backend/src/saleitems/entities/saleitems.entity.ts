import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document, SchemaTypes } from 'mongoose';
import { Exhibition } from 'src/exhibitions/entities/exhibition.entity';
import { Product } from 'src/products/entities/products.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

export enum SaleItemsStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FUTURE = 'FUTURE',
}

@Schema({ collection: 'auctionproducts', timestamps: true })
export class SaleItem extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Exhibition' })
  auction!: Exhibition;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
  product!: Product;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);
