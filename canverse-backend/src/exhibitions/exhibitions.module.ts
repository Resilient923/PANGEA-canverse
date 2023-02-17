import { Logger, Module } from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exhibition, ExhibitionSchema } from './entities/exhibition.entity';
import {
  SaleItem,
  SaleItemSchema,
} from 'src/saleitems/entities/saleitems.entity';
import {
  UserProductLike,
  UserProductLikeSchema,
} from 'src/user-product-likes/entities/user-product-like.entity';
import { Product, ProductSchema } from 'src/products/entities/products.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import {
  ProductOwner,
  ProductOwnerSchema,
} from 'src/product-owners/entities/product-owners.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: UserProductLike.name, schema: UserProductLikeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: ProductOwner.name, schema: ProductOwnerSchema },
    ]),
  ],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService, Logger],
})
export class ExhibitionsModule {}
