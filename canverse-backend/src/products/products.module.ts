import { Logger, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/products.entity';
import {
  Exhibition,
  ExhibitionSchema,
} from 'src/exhibitions/entities/exhibition.entity';
import {
  SaleItem,
  SaleItemSchema,
} from 'src/saleitems/entities/saleitems.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { Payment, PaymentSchema } from 'src/payments/entities/payment.entity';
import {
  UserProductLike,
  UserProductLikeSchema,
} from 'src/user-product-likes/entities/user-product-like.entity';
import { SaleitemsService } from 'src/saleitems/saleitems.service';
import { IamportService } from 'src/client/iamport.service';
import {
  ProductOwner,
  ProductOwnerSchema,
} from 'src/product-owners/entities/product-owners.entity';
import { S3Service } from 'src/client/s3.service';
import { SlackService } from 'src/client/slack.service';
import { PinataService } from 'src/client/pinata.service';

// import { SendgridService } from 'src/client/sendgrid.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductOwner.name, schema: ProductOwnerSchema },
      { name: User.name, schema: UserSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserProductLike.name, schema: UserProductLikeSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    SaleitemsService,
    IamportService,
    S3Service,
    PinataService,
    Logger,
    SlackService,
  ],
})
export class ProductsModule {}
