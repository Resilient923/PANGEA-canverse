import { Injectable } from '@nestjs/common';
import { CreateUserProductLikeDto } from './dto/create-user-product-like.dto';
import { UpdateUserProductLikeDto } from './dto/update-user-product-like.dto';

@Injectable()
export class UserProductLikesService {
  create(createUserProductLikeDto: CreateUserProductLikeDto) {
    return 'This action adds a new userProductLike';
  }

  findAll() {
    return `This action returns all userProductLikes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userProductLike`;
  }

  update(id: number, updateUserProductLikeDto: UpdateUserProductLikeDto) {
    return `This action updates a #${id} userProductLike`;
  }

  remove(id: number) {
    return `This action removes a #${id} userProductLike`;
  }
}
