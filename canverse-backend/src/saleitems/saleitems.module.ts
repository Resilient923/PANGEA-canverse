import { Module } from '@nestjs/common';
import { SaleitemsService } from './saleitems.service';
import { SaleItemsController } from './saleitems.controller';
import { SaleItem, SaleItemSchema } from './entities/saleitems.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Exhibition,
  ExhibitionSchema,
} from 'src/exhibitions/entities/exhibition.entity';
import { Payment, PaymentSchema } from 'src/payments/entities/payment.entity';
import { Product, ProductSchema } from 'src/products/entities/products.entity';
import {
  UserProductLike,
  UserProductLikeSchema,
} from 'src/user-product-likes/entities/user-product-like.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { SaleItemsRepo } from './saleitems.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserProductLike.name, schema: UserProductLikeSchema },
    ]),
  ],
  controllers: [SaleItemsController],
  providers: [SaleitemsService],
})
export class SaleitemsModule {}
