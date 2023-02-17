import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProductLikeDto } from './create-user-product-like.dto';

export class UpdateUserProductLikeDto extends PartialType(
  CreateUserProductLikeDto,
) {}
