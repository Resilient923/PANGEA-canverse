import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/products.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

@Schema({ collection: 'userproductllikes', timestamps: true })
export class UserProductLike extends Document {
  @Prop({ type: ObjectId, ref: 'User' })
  user!: User;

  @Prop({ type: ObjectId, ref: 'Product' })
  product!: Product;
}

export const UserProductLikeSchema =
  SchemaFactory.createForClass(UserProductLike);
