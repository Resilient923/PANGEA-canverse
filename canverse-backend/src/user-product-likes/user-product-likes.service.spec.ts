import { Test, TestingModule } from '@nestjs/testing';
import { UserProductLikesService } from './user-product-likes.service';

describe('UserProductLikesService', () => {
  let service: UserProductLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProductLikesService],
    }).compile();

    service = module.get<UserProductLikesService>(UserProductLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
