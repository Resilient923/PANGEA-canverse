import { Module } from '@nestjs/common';
import { ProductOwnersService } from './product-owners.service';
import { ProductOwnersController } from './product-owners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductOwner,
  ProductOwnerSchema,
} from './entities/product-owners.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductOwner.name, schema: ProductOwnerSchema },
    ]),
  ],
  controllers: [ProductOwnersController],
  providers: [ProductOwnersService],
})
export class ProductOwnersModule {}
