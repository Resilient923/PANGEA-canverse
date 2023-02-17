import { Test, TestingModule } from '@nestjs/testing';
import { ProductOwnersController } from './product-owners.controller';
import { ProductOwnersService } from './product-owners.service';

describe('ProductOwnersController', () => {
  let controller: ProductOwnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductOwnersController],
      providers: [ProductOwnersService],
    }).compile();

    controller = module.get<ProductOwnersController>(ProductOwnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
