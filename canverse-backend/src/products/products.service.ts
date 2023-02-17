import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  GetProductInfoParams,
  ProductUploadDto,
  PurchaseProductDto,
  PurchaseProductPaypal,
} from './dto/products.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, ObjectId, Connection } from 'mongoose';
import { Product, ProductType, SaleType } from './entities/products.entity';
import { Payment } from '../payments/entities/payment.entity';
import { UserProductLike } from 'src/user-product-likes/entities/user-product-like.entity';
import { User } from 'src/users/entities/user.entity';
import { IamportService } from 'src/client/iamport.service';
import { SaleItem } from 'src/saleitems/entities/saleitems.entity';
import mongoose from 'mongoose';
import { ProductOwner } from 'src/product-owners/entities/product-owners.entity';
import { S3Service } from 'src/client/s3.service';
import { Multer } from 'multer';
import {
  getExtension,
  getProductObjectKey,
  getThumbnailObjectKey,
  isImageExtension,
  isVideoExtension,
} from 'src/common/util/file';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';
//작품을 가져올 때 saleitmes를 가져오고 product를 populate하면 된다?

export interface UploadedFilesType {
  productFiles: Express.Multer.File[];
  thumbnailFiles?: Express.Multer.File[];
}

export enum PurchaseError {
  UNSUCCESSFUL_PAYMENT = 'UNSUCCESSFUL_PAYMENT',
  INVALID_IAMPORT_UID = 'INVALID_IAMPORT_UID',
  INVALID_SALE_ITEM = 'INVALID_SALE_ITEM',
  INVALID_BUYER_ID = 'INVALID_BUYER_ID',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  IAMPORT_PRODUCT_MISMATCH = 'IAMPORT_PRODUCT_MISMATCH',
  IAMPORT_PRICE_MISMATCH = 'IAMPORT_PRICE_MISMATCH',
  SOLD_OUT = 'SOLD_OUT',
}

export enum OwnershipStatus {
  OWNED = 'OWNED',
  EXPIRED = 'EXPIRED',
}

function isSuccessful(successStr: string) {
  const str = successStr?.toLowerCase();
  return str === 'true' || str === '1';
}

@Injectable()
export class ProductsService {
  productS3Bucket: string;

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(ProductOwner.name)
    private productOwnerModel: Model<ProductOwner>,
    @InjectModel(UserProductLike.name)
    private userProductLikeModel: Model<UserProductLike>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: Logger,
    @InjectConnection() private readonly connection: Connection,
    private imaportService: IamportService,
    private s3Service: S3Service,
    private configService: ConfigService<EnvironmentVariables>,
  ) {
    this.productS3Bucket = configService.get<string>('S3_USER_PRODUCTS_BUCKET');
  }

  prependS3ProductUrl(objectKey: string) {
    const url = new URL(
      objectKey,
      `https://${this.productS3Bucket}.s3.amazonaws.com`,
    );
    return url.href;
  }

  async purchaseProductPaypal(paypalPurchaseInfo: PurchaseProductPaypal) {
    console.log('paypal test', paypalPurchaseInfo);
    const { buyer, product, exhibition, currency, amount } = paypalPurchaseInfo;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const auctionProduct = await this.saleItemModel.findOne({
        product: product,
        auction: exhibition,
      });

      const isPayedProduct = await this.paymentModel.findOne({
        product: product,
        auction_product: auctionProduct._id,
      });
      console.log('is product?', isPayedProduct);
      if (isPayedProduct) {
        throw new BadRequestException({
          error: PurchaseError.UNSUCCESSFUL_PAYMENT,
        });
      }
      const payedProduct = await this.paymentModel.create([
        {
          buyer,
          product,
          auction_product: auctionProduct._id,
          currency,
          amount,
          pg_provider: 'paypal',
          send_offline_copy: false,
        },
      ]);

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        product,
        {
          $inc: { purchaseCount: 0.5 },
        },
        { session, new: true },
      );
      return;
    });
    session.endSession();
    return {};
  }

  async purchaseProduct(params: PurchaseProductDto) {
    // TODO: Distinguish single-item and edition product
    const {
      imp_uid: impUid,
      merchant_uid: merchantUid,
      success,
      imp_success: impSuccess, // Iamport uses "success=" or "imp_success=".
    } = params;

    this.logger.log(
      `purchaseProduct: ${impUid}, ${merchantUid}, ${success}, ${impSuccess}`,
    );

    // 1. Check success query param
    const successful = isSuccessful(success) || isSuccessful(impSuccess);
    if (!successful) {
      this.logger.log(`Payment for ${impUid} was not successful`);
      throw new BadRequestException({
        error: PurchaseError.UNSUCCESSFUL_PAYMENT,
      });
    }

    // 2. Check for existing payment
    console.log('impUid:', impUid);
    const existingPayment = await this.paymentModel
      .findOne({ impUid })
      .populate('product');
    if (existingPayment) {
      console.log('existing payment:'); //, existingPayment);
      this.logger.log(
        `Payment for ${impUid} was not successful: existing payment`,
      );
      //await existingPayment.populate('product');
      return existingPayment.product.toJSON();
    }

    // 3. Validate payment with Iamport
    const impPayment = await this.imaportService.getByImpUid(impUid);
    const customData = JSON.parse(impPayment?.custom_data ?? {});
    const impProductId = customData.productId;
    const impExhibitionId = customData.exhibitionId;
    const impBuyerId = customData.buyerId;

    console.log('imp custom data:', customData);

    if (!impPayment || !impProductId || !impExhibitionId || !impBuyerId) {
      console.log(
        'invalid import uid',
        impPayment,
        impProductId,
        impExhibitionId,
        impBuyerId,
      );
      throw new BadRequestException({
        error: PurchaseError.INVALID_IAMPORT_UID,
      });
    }

    // 3-1. Validate sale item
    const saleItem = await this.saleItemModel
      .findOne({ product: impProductId, auction: impExhibitionId })
      .populate('product');
    if (!saleItem) {
      this.logger.log('invalid sale item');
      throw new BadRequestException({
        error: PurchaseError.INVALID_SALE_ITEM,
      });
    }

    // 3-2. Validate product
    let product = saleItem.product;
    if (product._id.toString() !== impProductId) {
      this.logger.log(`Product mismatch`);
      throw new BadRequestException({
        error: PurchaseError.IAMPORT_PRODUCT_MISMATCH,
      });
    }

    if (product.purchaseCount >= product.totalQuantity) {
      // TODO: REFUND PAYMENT
      this.logger.log(`sold out`);
      throw new BadRequestException({
        error: PurchaseError.SOLD_OUT,
      });
    }

    // 3-3. Validate price
    if (
      impPayment.amount !== product.reserve_price &&
      impPayment.amount !== product.physical_reserve_price &&
      impPayment.amount !==
        product.reserve_price + product.physical_reserve_price &&
      impPayment.amount !== product.reserve_price2
    ) {
      this.logger.log(`wrong amount`);
      throw new BadRequestException({
        error: PurchaseError.IAMPORT_PRICE_MISMATCH,
      });
    }

    // 3-4. Validate buyer
    const buyer = this.userModel.findById(impBuyerId);
    if (!buyer) {
      this.logger.log(`no buyer found`);
      throw new BadRequestException({
        error: PurchaseError.INVALID_BUYER_ID,
      });
    }

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      // Increment product purchase count
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        product._id,
        {
          $inc: { purchaseCount: 1 },
        },
        { session, new: true },
      );

      // Edition check
      if (product.productType == ProductType.CONTAINER) {
        this.logger.log(`CONTAINER, getting child product`);
        const updatedChildProduct = await this.productModel.findOneAndUpdate(
          {
            mainProduct: product._id,
            purchaseCount: 0,
          },
          {
            $inc: { purchaseCount: 1 },
          },
          { session, new: true },
        );

        product = updatedChildProduct;
      }

      // Store the payment result in DB
      const newPayments = await this.paymentModel.create(
        [
          {
            impUid,
            product,
            auction_product: saleItem,
            amount: impPayment.amount,
            currency: impPayment.currency,
            //seller: product.user, // TODO:
            buyer: impBuyerId,
            pg_provider: impPayment.pg_provider,
            pgResponse: impPayment,
            receipt_url: impPayment.receipt_url,
            send_offline_copy:
              impPayment.amount === product.physical_reserve_price,
            paid_at: new Date(impPayment.paid_at * 1000),
          },
        ],
        { session, new: true },
      );

      // Invalidate all previous owners
      // TODO: Is this step really needed?
      await this.productOwnerModel.findOneAndUpdate(
        {
          product,
          status: OwnershipStatus.OWNED,
        },
        {
          $set: { status: OwnershipStatus.EXPIRED },
        },
        { session },
      );

      // Create a new product-owner
      const productOwner = await this.productOwnerModel.create(
        {
          product: product,
          auction: impExhibitionId,
          owner: impBuyerId,
          payment: newPayments[0],
          status: OwnershipStatus.OWNED,
        },
        null,
        { session, new: true },
      );
      this.logger.log(
        `Product ownership successfully transferred to ${impBuyerId}`,
      );

      return updatedProduct.toJSON();
    });
    session.endSession();
    return {};
  }

  async iamportTest() {
    this.logger.log('iamport test');
    const response = await this.imaportService.getByImpUid('imp_721505221429');
    this.logger.log(`response: ${JSON.stringify(response, null, 2)}`);
  }

  async like(productId: string, user: User) {
    this.logger.log(productId);
    if (!productId || !user) {
      throw new BadRequestException('productId or user not exist');
    }
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const like = await this.userProductLikeModel.findOneAndUpdate(
        {
          user: user._id,
          product: productId,
        },
        {},
        { new: true, upsert: true, rawResult: true, session },
      );
      //false 일 떄 아래 수행
      if (!like.lastErrorObject.updatedExisting) {
        const productLike = await this.productModel.findByIdAndUpdate(
          productId,
          { $inc: { user_likes: 1 } },
          { new: true, session },
        );
        this.logger.log(productLike);
      }
    });
    session.endSession();
    return {};
  }

  async unlike(productId: string, user: User) {
    if (!productId || !user) {
      throw new BadRequestException('productId or user not exist');
    }
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const unlike = await this.userProductLikeModel.findOneAndDelete(
        {
          user: user._id,
          product: productId,
        },
        { session },
      );
      if (unlike) {
        const productUnlike = await this.productModel.findByIdAndUpdate(
          productId,
          {
            $inc: { user_likes: -1 },
          },
          { session },
        );
      }
    });
    session.endSession();
    return {};
  }

  async createProduct(
    productInfo: ProductUploadDto,
    files: UploadedFilesType,
    user: User,
  ) {
    const {
      author_name,
      title,
      producedyear,
      material,
      cmheight,
      cmwidth,
      pxheight,
      pxwidth,
      currency,
      reserve_price,
      description,
      author_birth,
      author_country,
      is_pyhsical_artwork,
      send_physical_rightaway,
      send_physical_rightaway_date,
      send_physical_rightaway_reason,
      physical_reserve_price,
      additionalInfo,
    } = productInfo;
    this.logger.log(productInfo);

    // 랜덤 하게 productId 부여
    const prefix = Date.now().toString();

    const { productFiles, thumbnailFiles } = files;
    const productS3Path = await this.handleProductFile(
      prefix,
      productFiles?.[0],
    );
    const thumbnailS3Path = await this.handleThumbnailFile(
      prefix,
      productFiles?.[0],
      thumbnailFiles?.[0],
    );

    this.logger.log(`product S3${productS3Path}`);
    this.logger.log(`thumbnail S3${thumbnailS3Path}`);

    /*const newProduct = new Product({
      user: user._id,
      file_img_path: productS3Path,
      thumb_img_path: thumbnailS3Path,
      author_name,
      title,
      reserve_price,
      description,
      /*producedyear,
      material,
      cmheight,
      cmwidth,
      currency,
      author_country,
      author_birth,
      is_pyhsical_artwork,
      send_physical_rightaway,
      send_physical_rightaway_date,
      send_physical_rightaway_reason,
      physical_reserve_price,
      productType: ProductType.UNIQUE,
      saleType: SaleType.FIXED_PRICE_FIAT_UNIQUE,
    });*/
    //newProduct.productfile = uploadFile;
    const uploadProduct = await this.productModel.create([
      {
        user: user._id,
        file_img_path: productS3Path,
        thumb_img_path: thumbnailS3Path,
        author_name,
        title,
        reserve_price,
        description,
        producedyear,
        material,
        cmheight,
        cmwidth,
        pxheight,
        pxwidth,
        currency,
        author_country,
        author_birth,
        is_pyhsical_artwork,
        send_physical_rightaway,
        send_physical_rightaway_date,
        send_physical_rightaway_reason,
        physical_reserve_price,
        additionalInfo,
        // TODO: Support edition products
        productType: ProductType.UNIQUE,
        saleType: SaleType.FIXED_PRICE_FIAT_UNIQUE,
      },
    ]);
    return uploadProduct;
  }

  private async handleProductFile(
    productId: string,
    productFile: Express.Multer.File,
  ): Promise<string> {
    if (!productFile) {
      throw new BadRequestException('No product file to upload');
    }
    const objectKey = getProductObjectKey(
      productId.toString(),
      productFile.originalname,
    );
    const uploadProductS3 = await this.s3Service.uploadProduct(
      objectKey,
      productFile.buffer,
    );
    return this.prependS3ProductUrl(objectKey);
  }

  private async handleThumbnailFile(
    productId: string,
    productFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
  ): Promise<string> {
    if (!productFile) {
      throw new BadRequestException('No product file to upload');
    }
    const isVideo = isVideoExtension(productFile.originalname);

    if (isVideo && !thumbnailFile) {
      throw new BadRequestException('No thumbnail file to upload');
    }

    this.logger.log(`productFile:${productFile.originalname}`);
    const isImage = isImageExtension(productFile.originalname);

    if (isImage) {
      const objectKey = getProductObjectKey(
        productId.toString(),
        productFile.originalname,
      );
      return this.prependS3ProductUrl(objectKey);
    }

    // TODO: Resize image

    const objectKey = getThumbnailObjectKey(
      productId.toString(),
      thumbnailFile.originalname,
    );
    const uploadProductS3 = await this.s3Service.uploadProduct(
      objectKey,
      thumbnailFile.buffer,
    );
    return this.prependS3ProductUrl(objectKey);
  }
}
