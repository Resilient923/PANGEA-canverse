import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose } from 'mongoose';
import { ExhibitionStatus } from 'src/exhibitions/types';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/products.entity';
import { UserProductLike } from 'src/user-product-likes/entities/user-product-like.entity';
import { User } from 'src/users/entities/user.entity';
import {
  GetPurchaseHistoriesParams,
  GetSaleItemInfoParams,
} from './dto/saleitems.dto';
import { SaleItem } from './entities/saleitems.entity';
// import { SaleItemsRepo } from './saleitems.repo';
export interface GetSaleItemInfoResponse {
  _id: string;
  title: string;
  file_img_path: string;
  description: string;
  is_digital_artwork: boolean;
  send_physical_artwork: boolean;
  // user: AuthorType;
  blockchain: string;
  nft_status: string;
  tokenId: number;
  reserve_price: number;
  totalQuantity: number;
  purchaseCount: number;
  user_likes: number;
  exhibition: {
    _id: string;
    title: string;
    logoUrl: string;
    start_date: string;
    end_date: string;
  };
  user: {
    _id: string;
    name: string;
    profile_img_path: string;
  };
}
@Injectable()
export class SaleitemsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(UserProductLike.name)
    private userProductLikeModel: Model<UserProductLike>,
    @InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getAllSaleItems() {
    try {
      const allSaleItems = await this.saleItemModel.find({});
      return allSaleItems;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async getSaleItemInfo(
    params: GetSaleItemInfoParams,
  ): Promise<Partial<GetSaleItemInfoResponse>> {
    const { id } = params;
    if (!id) {
      throw new BadRequestException('no saleitme');
    }
    try {
      const saleItem = await this.saleItemModel
        .findOne({
          product: id,
        })
        .populate('product')
        .populate('auction');
      await this.productModel.populate(saleItem, {
        path: 'product.user',
        select: '_id name profile_img_path',
      });

      return saleItem;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async getPurchaseHistories(params: GetPurchaseHistoriesParams) {
    const { id } = params;
    if (!id) {
      throw new BadRequestException('no purchase histories');
    }
    const paymentModels = await this.paymentModel
      .find({ auction_product: id })
      .select('paid_at buyer')
      .sort({ paid_at: -1 })
      .populate('buyer', '_id name profile_img_path')
      .exec();

    const payments = paymentModels.map((model) => model.toJSON());

    return payments;
  }

  async isProductLikedByUser(
    user: User | null,
    productId: string,
  ): Promise<boolean> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }
    if (!user) {
      return false;
    }

    const likeExists = await this.userProductLikeModel.findOne({
      user: user._id,
      product: productId,
    });
    return likeExists ? true : false;
  }

  async getByProductId(productId: string, user: User | null) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    const likedByUser = await this.isProductLikedByUser(user, productId);

    const saleItems = await this.saleItemModel
      .find({
        product: productId,
      })
      .populate({
        path: 'product',
        populate: {
          path: 'user',
          select: '_id name profile_img_path',
        },
      })
      .populate('auction')
      .sort({ createdAt: -1 })
      .limit(1);

    const saleItem = saleItems?.[0]?.toJSON();
    if (saleItem) {
      const params = new GetPurchaseHistoriesParams();
      params.id = saleItem._id.toString();
      const purchaseHistories = await this.getPurchaseHistories(params);

      return {
        product: saleItem.product,
        exhibition: saleItem.auction,
        purchaseHistories,
        likedByUser,
      };
    }

    const product = await this.productModel.findById(productId).populate({
      path: 'user',
      select: '_id name profile_img_path',
    });
    if (!product) {
      throw new BadRequestException(`Product ID ${productId} does not exist`);
    }

    return {
      product: product.toJSON(),
      exhibition: null,
      purchaseHistories: [],
      likedByUser,
    };

    //return saleItems[0].toJSON();
  }
}
