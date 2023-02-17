import { Test, TestingModule } from '@nestjs/testing';
import { SaleitemsService } from './saleitems.service';

describe('SaleitemsService', () => {
  let service: SaleitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaleitemsService],
    }).compile();

    service = module.get<SaleitemsService>(SaleitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
