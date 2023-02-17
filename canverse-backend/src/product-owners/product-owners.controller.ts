import { Controller } from '@nestjs/common';
import { ProductOwnersService } from './product-owners.service';

@Controller('product-owners')
export class ProductOwnersController {
  constructor(private readonly productOwnersService: ProductOwnersService) {}
}
