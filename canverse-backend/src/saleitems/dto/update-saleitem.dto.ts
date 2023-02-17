import { PartialType } from '@nestjs/swagger';
import { CreateSaleitemDto } from './create-saleitem.dto';

export class UpdateSaleitemDto extends PartialType(CreateSaleitemDto) {}
