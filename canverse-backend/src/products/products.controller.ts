import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { ProductsService, UploadedFilesType } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
  MulterModule,
} from '@nestjs/platform-express';
import { ReqUser } from 'src/common/decorator';
import { User } from 'src/users/entities/user.entity';
import {
  GetProductInfoParams,
  ProductUploadDto,
  PurchaseProductDto,
  SendEmailParams,
  PurchaseProductPaypal,
} from './dto/products.dto';
import { AuthGuard } from '@nestjs/passport';
import { SaleitemsService } from 'src/saleitems/saleitems.service';
import { OptionalJwtGuard } from 'src/users/optional.jwt.guard';
// import { SendgridService } from 'src/client/sendgrid.service';
@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(
    private logger: Logger,
    private productsService: ProductsService, // private sendgridService: SendgridService,
    private saleItemsService: SaleitemsService,
  ) {}

  // create product implementsm
  @ApiOperation({ summary: 'Create product' })
  @Post()
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'productFiles', maxCount: 1 },
      { name: 'thumbnailFiles', maxCount: 1 },
    ]),
  )
  async createProduct(
    @Body() productInfo: ProductUploadDto,
    @UploadedFiles() file: UploadedFilesType,
    @ReqUser() user: User,
  ) {
    return this.productsService.createProduct(productInfo, file, user);
  }

  // @ApiOperation({ summary: 'Update product' })
  // @Patch()
  // async updateProduct(@Body() params: UpdateProductDto) {
  //   const product = await this.productsService.updateProduct();
  //   return product;
  // }

  @Get('iamport')
  async test() {
    this.logger.log('Iamport');
    await this.productsService.iamportTest();
  }

  //like implements

  @ApiOperation({ summary: 'Like product' })
  @Post('like')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async like(@Body('id') productId: string, @ReqUser() user: User) {
    return this.productsService.like(productId, user);
  }

  //unlike implements
  @ApiOperation({ summary: 'Unlike product' })
  @Post('unlike')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async unLike(@Body('id') productId: string, @ReqUser() user: User) {
    return this.productsService.unlike(productId, user);
  }

  @ApiOperation({ summary: 'Get by product ID' })
  @UseGuards(OptionalJwtGuard)
  @Get(':id/saleitem')
  async get(@Param('id') productId: string, @ReqUser() user: User | null) {
    return this.saleItemsService.getByProductId(productId, user);
  }

  // //purchase implements
  // TODO: Is this needed?
  @ApiOperation({ summary: 'Purchase product through redirect' })
  @Get('/purchase_redirect')
  async purchaseProductRedirect(@Query() query: PurchaseProductDto) {
    return await this.productsService.purchaseProduct(query);
  }

  @ApiOperation({ summary: 'Purchase product paypal' })
  @Post('/purchase_paypal')
  async purchaseProductPaypal(
    @Body() paypalPurchaseInfo: PurchaseProductPaypal,
  ) {
    return await this.productsService.purchaseProductPaypal(paypalPurchaseInfo);
  }

  //sendgrid service
  // @ApiOperation({ summary: 'Send email when purchased' })
  // @Post('sendgrid')
  // async sendPurchaseEmail(params: SendEmailParams) {
  //   return this.sendgridService.sendEmail(params);
  // }

  // @ApiOperation({ summary: 'test get all products' })
  // @Get('test')
  // async getAllProducts() {
  //   return this.productsService.getAllProducts();
  // }
}
