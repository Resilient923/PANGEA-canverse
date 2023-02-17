import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SaleitemsService } from './saleitems.service';
import { CreateSaleitemDto } from './dto/create-saleitem.dto';
import { UpdateSaleitemDto } from './dto/update-saleitem.dto';
import { ApiOAuth2, ApiOperation } from '@nestjs/swagger';
import { SaleItemsStatus } from './entities/saleitems.entity';
import {
  GetSaleItemInfoParams,
  GetPurchaseHistoriesParams,
} from '../saleitems/dto/saleitems.dto';
@Controller('saleitems')
export class SaleItemsController {
  constructor(private readonly saleitemsService: SaleitemsService) {}

  // @ApiOperation({ summary: ' Create saleitems' })
  // @Post()
  // async createSaleItems(@Body() Param: createSaleItemDto) {
  //   return this.saleitemsService.createSaleItems();
  // }

  // @ApiOperation({ summary: 'Purchase saleitems' })
  // @Post('purchase/webhook')
  // async purchaseSaleItems(
  //   @Body('purchaseDto') pruchaseSaleItemsDto: purchaseSaleItmesDto,
  // ) {
  //   return this.saleitemsService.purchaseSaleItmes();
  // }

  // //param: saleItemsStatus 으로 하면 좀 제한적인 것 같긴합니다
  // //그냥 나중에 Service에서 처리하는 방향으로 하면 될까요?
  // @ApiOperation({ summary: ' Get saleitmes by sale items status' })
  // @Get()
  // //get saleitems에서 productDto로 params를 하는게 맞는지 아니면 saleItemsStatus랑 exhibitionStatus따로? 아니면 같이?
  // async getSaleItems(@Query() params: saleItemsStatus){
  //   return this.saleitemsService.getFilteredSaleItems(params);
  // }
  @ApiOperation({ summary: 'Get all saleitems' })
  @Get()
  async getAllSaleItems() {
    return this.saleitemsService.getAllSaleItems();
  }

  @ApiOperation({ summary: 'Get purchase histories' })
  @Get(':id/purchasehistories')
  // @ApiBearerAuth('jwt')
  async getPurchaseHistories(@Param() params: GetPurchaseHistoriesParams) {
    return this.saleitemsService.getPurchaseHistories(params);
  }
  @ApiOperation({ summary: 'get saleitems detail' })
  @Get(':id')
  async getSaleItemInfo(@Param() params: GetSaleItemInfoParams) {
    return this.saleitemsService.getSaleItemInfo(params);
  }
}
