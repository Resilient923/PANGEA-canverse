import { Module } from '@nestjs/common';
import { UserProductLikesService } from './user-product-likes.service';
import { UserProductLikesController } from './user-product-likes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserProductLike,
  UserProductLikeSchema,
} from './entities/user-product-like.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProductLike.name, schema: UserProductLikeSchema },
    ]),
  ],
  controllers: [UserProductLikesController],
  providers: [UserProductLikesService],
})
export class UserProductLikesModule {}
