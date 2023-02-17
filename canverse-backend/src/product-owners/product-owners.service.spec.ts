import { Test, TestingModule } from '@nestjs/testing';
import { ProductOwnersService } from './product-owners.service';

describe('ProductOwnersService', () => {
  let service: ProductOwnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductOwnersService],
    }).compile();

    service = module.get<ProductOwnersService>(ProductOwnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
