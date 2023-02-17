import { Test, TestingModule } from '@nestjs/testing';
import { UserProductLikesController } from './user-product-likes.controller';
import { UserProductLikesService } from './user-product-likes.service';

describe('UserProductLikesController', () => {
  let controller: UserProductLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProductLikesController],
      providers: [UserProductLikesService],
    }).compile();

    controller = module.get<UserProductLikesController>(
      UserProductLikesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
