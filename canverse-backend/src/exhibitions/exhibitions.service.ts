import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductOwner } from 'src/product-owners/entities/product-owners.entity';
import {
  Product,
  SupportedCurrency,
} from 'src/products/entities/products.entity';
import { SaleItem } from 'src/saleitems/entities/saleitems.entity';
import { UserProductLike } from 'src/user-product-likes/entities/user-product-like.entity';
import { ProductsType } from 'src/users/dto/common.type';
import { User } from 'src/users/entities/user.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import {
  ExhibitionFilterDto,
  ExhibitionTypeFilterDto,
} from './dto/exhibitions.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { Exhibition } from './entities/exhibition.entity';
import { ExhibitionOrder, ExhibitionStatus } from './types';

export interface SaleItemCard {
  _id: string;
  exhibition: {
    _id: string;
    startDate: Date;
    endDate: Date;
    title: string;
    logoUrl: string;
    exhibitionType: string;
    // organizationNames: {
    //   en: string;
    //   ko: string;
    // };
  };
  product: {
    _id: string;
    title: string;
    productType: string;
    editionNumber: number;
    purchaseCount: number;
    totalQuantity: number;

    currency: string;
    nftPrice: number;
    physicalProductPrice: number;

    filePath: string;
    thumbImagePath: string;
    thumbVideoPath?: string;
    user_likes: number;
  };
}

function buildSaleItemResponse(item: SaleItem): SaleItemCard {
  const exhibition = item.auction;
  const product = item.product;
  const response = {
    _id: item._id.toString(),
    exhibition: {
      _id: exhibition?._id?.toString(),
      startDate: exhibition?.start_date,
      endDate: exhibition?.end_date,
      title: exhibition?.title,
      logoUrl: exhibition?.logoUrl,
      exhibitionType: exhibition?.exhibitionType,
      // organizationNames: exhibition?.organizationNames,
    },
    product: {
      _id: product?._id?.toString(),
      title: product?.title,
      user: product?.user,
      productType: product?.productType,
      editionNumber: product?.editionNumber,
      purchaseCount: product?.purchaseCount,
      totalQuantity: product?.totalQuantity,

      currency: product?.currency ?? SupportedCurrency.KRW,
      nftPrice: product?.reserve_price,
      physicalProductPrice: product?.physical_reserve_price,

      filePath: product?.file_img_path,
      thumbImagePath: product?.thumb_img_path,
      thumbVideoPath: product?.videoThumbnailPath,
      user_likes: product?.user_likes,
    },
  };

  return response;
}

@Injectable()
export class ExhibitionsService {
  constructor(
    @InjectModel(Exhibition.name) private exhibitionModel: Model<Exhibition>,
    @InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserProductLike.name)
    private userProductLikeModel: Model<UserProductLike>,
    @InjectModel(ProductOwner.name)
    private productOwnerModel: Model<ProductOwner>,
    private readonly logger: Logger,
  ) {}

  // Get who owns which products
  async getOwnersByProduct(products: Product[]): Promise<Map<string, User>> {
    const ownerMap = new Map<string, User>();

    const productOwners = await this.productOwnerModel
      .find({
        product: { $in: products },
      })
      .select('_id product owner auction payment')
      .populate('owner', '_id name profile_img_path')
      .populate({
        path: 'product',
        populate: {
          path: 'user',
          select: '_id name profile_img_path',
        },
        select: 'reserve_price thumb_img_path title _id user_likes user',
      });

    /*await this.userModel.populate(productOwners, {
      path: 'product.user',
    });*/
    for (const productOwner of productOwners) {
      ownerMap.set(productOwner.product._id.toString(), productOwner.owner);
    }

    return ownerMap;
  }

  // Get products liked by user
  async getLikesByProduct(
    user: User,
    products: Product[],
  ): Promise<Set<string>> {
    const likeSet = new Set<string>();
    if (!user) {
      return likeSet;
    }

    const userLikes = await this.userProductLikeModel
      .find({ user, product: { $in: products } })
      .select('product');
    userLikes.forEach((like) => likeSet.add(like.product.toString()));
    return likeSet;
  }

  // active exhibition 을 가져온다.
  async findActiveExhibition(user: User | null) {
    const activeExhibition = await this.exhibitionModel
      .findOne({
        status: ExhibitionStatus.ACTIVE,
      })
      .select('title organizationNames start_date end_date');

    if (!activeExhibition) {
      return {
        activeExhibition: null,
        activeProducts: [],
      };
    }
    this.logger.log(activeExhibition);
    const activeSaleitems = await this.saleItemModel
      .find({
        auction: activeExhibition,
      })
      .select('product')
      .populate(
        'product',
        'reserve_price reserve_price2 currency currency2 file_img_path thumb_img_path title _id user_likes user',
      );
    await this.userModel.populate(activeSaleitems, {
      path: 'product.user',
      select: '_id name profile_img_path',
    });
    const products = activeSaleitems.map((x) => x.product);

    // Get who owns which products
    const ownerMap = await this.getOwnersByProduct(products);
    // Get products liked by user
    const likeSet = await this.getLikesByProduct(user, products);

    const results = [];
    for (const product of products) {
      const productId = product._id.toString();
      const result: ProductsType = {
        product: product,
        owner: ownerMap.get(productId),
        creator: product.user,
        likedByUser: likeSet.has(productId),
      };
      results.push(result);
    }
    return {
      activeExhibition: activeExhibition.toJSON(),
      activeProducts: results,
    };
  }

  async filterSaleItems(params: ExhibitionFilterDto): Promise<SaleItemCard[]> {
    const { exhibitionType, status, ids, order } = params;

    // TODO: Expand this to a general filter & sort function

    /*
    if (!exhibitionType && !status && !ids) {
      throw new BadRequestException(
        'One of exhibitionType, status, ids is required',
      );
    }
    */

    const exhibitions = await this.findExhibitions(exhibitionType, status, ids);
    const filter = exhibitions ? { auction: { $in: exhibitions } } : {};
    const saleItems = await this.saleItemModel
      .find(filter)
      .populate('auction')
      .populate('product')
      // TODO: Remove this limit.
      .sort({ createdAt: -1 });

    if (order) {
      switch (order) {
        case ExhibitionOrder.LIKES:
          saleItems.sort((a, b) => {
            if (a.product.user_likes > b.product.user_likes) {
              return -1;
            }
            if (a.product.user_likes < b.product.user_likes) {
              return 1;
            }

            return 0;
          });
          break;

        case ExhibitionOrder.MINMAX:
          saleItems.sort((a, b) => {
            if (a.product.reserve_price < b.product.reserve_price) {
              return -1;
            }
            if (a.product.reserve_price > b.product.reserve_price) {
              return 1;
            }

            return 0;
          });
          break;

        case ExhibitionOrder.MAXMIN:
          saleItems.sort((a, b) => {
            if (a.product.reserve_price > b.product.reserve_price) {
              return -1;
            }
            if (a.product.reserve_price < b.product.reserve_price) {
              return 1;
            }

            return 0;
          });
          break;
      }
    }

    await this.userModel.populate(saleItems, {
      path: 'product.user',
      select: '_id name profile_img_path',
    });

    return saleItems.map((item) => buildSaleItemResponse(item));
  }

  async filterByType(params: ExhibitionTypeFilterDto) {
    const { exhibitionType } = params;
    const exhibitions = await this.exhibitionModel.find({
      exhibitionType: exhibitionType,
      //status: [ExhibitionStatus.ACTIVE, ExhibitionStatus.FINISHED],
    });
    return exhibitions;
  }

  async findExhibitions(exhibitionType: string, status: string, ids: string[]) {
    const filter = {};
    if (ids?.length) {
      Object.assign(filter, { _id: { $in: ids } });
    }

    if (exhibitionType) {
      Object.assign(filter, { exhibitionType });
    }

    if (status) {
      Object.assign(filter, { status });
    }

    if (filter === {}) {
      return null; // null means all exhibitions
    }

    const filtered = await this.exhibitionModel.find(filter).exec();
    return filtered;
  }
}
