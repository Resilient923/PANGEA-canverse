import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/products.entity';
import { Exhibition } from 'src/exhibitions/entities/exhibition.entity';
import { Payment } from 'src/payments/entities/payment.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

export enum ProductOwnerStatus {
  OWNED = 'OWNED',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true })
export class ProductOwner extends Document {
  @Prop({ type: ObjectId, ref: 'Product' })
  product!: Product;

  @Prop({ type: ObjectId, ref: 'User' })
  owner!: User;

  @Prop({ type: ObjectId, ref: 'Exhibition' })
  auction!: Exhibition;

  @Prop({ type: ObjectId, ref: 'Payment' })
  payment: Payment;

  @Prop({
    type: String,
    enum: Object.keys(ProductOwnerStatus),
    default: ProductOwnerStatus.OWNED,
  })
  status: string;
}

export const ProductOwnerSchema = SchemaFactory.createForClass(ProductOwner);
