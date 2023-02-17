import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document, ObjectId } from 'mongoose';
import { SaleItem } from 'src/saleitems/entities/saleitems.entity';
import { Product } from 'src/products/entities/products.entity';
import { User } from 'src/users/entities/user.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop()
  amount!: number;

  @Prop({ type: String, default: 'KRW' })
  currency!: string;

  // 원래 db에서는 auction_product를 가져오는데 써보니까 product가 편해서 변경했습니다.
  // auction_product로 해놓으셨던 이유가 따로 있으면 수정해놓겠습니다!
  @Prop({ type: ObjectId, ref: 'SaleItem' })
  auction_product!: SaleItem;

  @Prop({ type: ObjectId, ref: 'Product' })
  product!: Product;

  @Prop({ type: ObjectId, ref: 'User' })
  seller!: User;

  @Prop({ type: ObjectId, ref: 'User' })
  buyer!: User;

  @Prop()
  impUid: string;

  @Prop({ type: Object })
  // eslint-disable-next-line @typescript-eslint/ban-types
  pgResponse!: Object;

  @Prop()
  pg_provider!: string;

  @Prop()
  receipt_url!: string;

  @Prop({ type: Boolean, default: true })
  send_offline_copy: boolean;

  @Prop({ type: Date, default: Date.now })
  paid_at!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
