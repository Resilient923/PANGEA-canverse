import { Test, TestingModule } from '@nestjs/testing';
import { SaleItemsController } from './saleitems.controller';
import { SaleitemsService } from './saleitems.service';

describe('SaleitemsController', () => {
  let controller: SaleItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleItemsController],
      providers: [SaleitemsService],
    }).compile();

    controller = module.get<SaleItemsController>(SaleItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
