import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserProductLikesService } from './user-product-likes.service';
import { CreateUserProductLikeDto } from './dto/create-user-product-like.dto';
import { UpdateUserProductLikeDto } from './dto/update-user-product-like.dto';

@Controller('user-product-likes')
export class UserProductLikesController {
  constructor(
    private readonly userProductLikesService: UserProductLikesService,
  ) {}

  @Post()
  create(@Body() createUserProductLikeDto: CreateUserProductLikeDto) {
    return this.userProductLikesService.create(createUserProductLikeDto);
  }

  @Get()
  findAll() {
    return this.userProductLikesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userProductLikesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserProductLikeDto: UpdateUserProductLikeDto,
  ) {
    return this.userProductLikesService.update(+id, updateUserProductLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userProductLikesService.remove(+id);
  }
}
