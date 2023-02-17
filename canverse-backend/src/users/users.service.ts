import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendgridEmailService } from 'src/client/sendgrid.service';
import { TwilioService } from 'src/client/twilio.service';
import { generateAlphanumeric } from 'src/common/stringutil';
import {
  comparePassword,
  getNewPassword,
  hashPassword,
} from 'src/common/util/password';
import { selectRandomly } from 'src/common/util/random';
import { ProductOwner } from 'src/product-owners/entities/product-owners.entity';
import { Product, ProductType } from 'src/products/entities/products.entity';
import { UserProductLike } from 'src/user-product-likes/entities/user-product-like.entity';
import { ProductsType, UserType } from './dto/common.type';
import { CreateUserDto } from './dto/create-user.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import {
  ResetPasswordRequestDto,
  ResetPasswordUpdateDto,
} from './dto/reset-password.dto';
import { SignupWithEmailDto } from './dto/signup-with-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {
  VerifyPhoneRequestDto,
  VerifyPhoneValidateDto,
} from './dto/verify-phone.dto';
import {
  TemporaryToken,
  TemporaryTokenType,
} from './entities/temporary-tokens.entity';
import { User } from './entities/user.entity';
import { AccessToken } from './passport/types';
import { TemporaryTokensService } from './temporary-tokens.service';

// OTP for phone verification expires in 30 minuntes.
const PHONE_VERIFICATION_OTP_EXPIRES_MIN = 30;

const RESET_PASSWORD_TOKEN_LENGTH = 20;

// OTP for resetting password expires in 2 hours.
const RESET_PASSWORD_TOKEN_EXPIRES_MIN = 2 * 60;

const PROFILE_IMAGE_URLS = [
  'https://canverse-static.s3.amazonaws.com/profile/profile-mondrian-1.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-mondrian-2.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-mondrian-5.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-single-1.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-single-5.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-universe-1.png',
  'https://canverse-static.s3.amazonaws.com/profile/profile-universe-4.png',
];

function stripSecret(user: User): Partial<User> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

function generatePhoneOtp(): string {
  // Generate 6-digit OTP code for phone verification
  // TODO: Use crypto package instead of Math.random()
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
}

// TODO: Get the base URL from environment
function buildResetPasswordUrl(token: string) {
  return `https://canverse.org/reset-password/${token}`;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ProductOwner.name)
    private productOwnerModel: Model<ProductOwner>,
    private temporaryTokenService: TemporaryTokensService,
    private twilioService: TwilioService,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(UserProductLike.name)
    private userProductLikeModel: Model<UserProductLike>,
    private emailService: SendgridEmailService,
    private jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async create(params: SignupWithEmailDto): Promise<User> {
    const { email: inputEmail, name: inputName, password } = params;
    const email = inputEmail?.toLowerCase()?.trim();
    const name = inputName?.trim();

    const errors: string[] = [];

    if (!email) {
      //throw new BadRequestException(`"${email}" is an invalid email.`);
      errors.push('INVALID_EMAIL');
    }

    if (!name) {
      //throw new BadRequestException(`"${name}" is an invalid name.`);
      errors.push('INVALID_NAME');
    }

    if (errors.length) {
      throw new BadRequestException({ errors });
    }

    // TODO: Check password format

    const userWithEmail = await this.findByEmail(email);
    if (userWithEmail) {
      /*throw new BadRequestException(
        `User with email "${email}" already exists`,
      );*/
      errors.push('EMAIL_EXISTS');
    }

    const userWithName = await this.userModel.findOne({ name });
    if (userWithName) {
      /*throw new BadRequestException({
        error: 'user with name exists',
        statusCode: '123421',
      });*/
      errors.push('NAME_EXISTS');
      //throw new BadRequestException(`User with name "${name}" already exists`);
    }

    if (errors.length) {
      throw new BadRequestException({ errors });
    }

    // TODO: Select profile pic randomly
    const profileImagePath = selectRandomly(PROFILE_IMAGE_URLS);

    const newUser: User = await this.userModel.create({
      email,
      name,
      password: await hashPassword(password),
      profile_img_path: profileImagePath,
    });

    return newUser;
  }

  async findAll() {
    // Getting thousands of users is a big task. Limit to 10 for now.
    this.logger.warn('Warning: big query');
    const models = await this.userModel.find().limit(10);
    return models;
  }

  async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User> | null {
    const user = await this.userModel.findOne({ email });
    if (user && (await comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User> | null {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async findById(id: string): Promise<User> | null {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getPublicInfo(id: string): Promise<Partial<User>> | null {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    const {
      _id,
      name,
      email,
      description1,
      description2,
      insta,
      facebook,
      twitter,
      portfolio_website,
      profile_img_path,
    } = user;

    return {
      _id,
      name,
      email,
      description1,
      description2,
      insta,
      facebook,
      twitter,
      portfolio_website,
      profile_img_path,
    };
  }

  async getProfile(user: User) {
    const userProfile = await this.userModel.findById(user._id);
    return userProfile;
  }
  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async googleAuth(params: GoogleAuthDto): Promise<AccessToken> {
    const { email, name, googleUserId } = params;

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.userModel.create({
        email,
        name,
        password: await getNewPassword(64),
        googleUserId,
      });
    }

    if (!user.googleUserId) {
      user.googleUserId = googleUserId;
      user.save();
    }

    return this.getAccessToken(user);
  }

  async getAccessToken(user: User): Promise<AccessToken> {
    const payload = { email: user.email, name: user.name, sub: user._id };

    return {
      accessToken: this.jwtService.sign(payload),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      profileImageUrl: user.profile_img_path,
    };
  }

  //  get user collected, created products
  async getCollectedProducts(userId: string, user: User | null) {
    const collectedProducts = await this.productOwnerModel
      .find({ owner: userId })
      .populate(
        'product',
        'user reserve_price thumb_img_path title _id user_likes mainProduct',
      )
      .populate('owner', '_id name user_name profile_img_path')
      .sort({ createdAt: -1 });
    await this.userModel.populate(collectedProducts, {
      path: 'product.user',
      select: '_id name email profile_img_path',
    });
    if (user) {
      const results = [];
      const userLikes = await this.userProductLikeModel
        .find({ user: user._id })
        .select('product');
      const id = userLikes.map((ul) => ul.product.toString());
      const likeSet = new Set(id);
      for (const collected of collectedProducts) {
        const result: ProductsType = {
          product: collected.product,
          owner: collected.owner,
          creator: collected.product.user,
          likedByUser: likeSet.has(collected.product._id.toString()),
        };
        results.push(result);
      }
      return results;
    } else {
      const results = [];
      for (const collected of collectedProducts) {
        const result: ProductsType = {
          product: collected.product,
          owner: collected.owner,
          creator: collected.product.user,
          likedByUser: false,
        };
        results.push(result);
      }
      return results;
    }
  }

  async getCreatedProducts(userId: string, user: User | null) {
    // const userInfo = await this.userModel
    //   .findById(userId)
    //   .select('_id name email profile_img_path');
    const productsInfo = await this.productModel
      .find({
        user: userId,
        productType: { $ne: 'EDITION' },
      })
      .select('reserve_price thumb_img_path title _id user_likes')
      .populate('user', '_id name email profile_img_path');
    const purchasedProducts = await this.productOwnerModel
      .find({
        product: { $in: productsInfo },
      })
      .select('_id product owner auction payment')
      .populate('owner', '_id name email profile_img_path');
    const data = new Map();
    for (const x of purchasedProducts) {
      data.set(x.product.toString(), x.owner);
    }
    if (user) {
      const userLikes = await this.userProductLikeModel
        .find({ user: user._id })
        .select('product');
      const id = userLikes.map((ul) => ul.product.toString());
      const likeSet = new Set(id);
      const results = [];
      for (const x of productsInfo) {
        const result: ProductsType = {
          product: x,
          owner: data.get(x._id.toString()) || null,
          creator: x.user,
          likedByUser: likeSet.has(x._id.toString()),
        };
        results.push(result);
      }
      return results;
    } else {
      const results = [];
      for (const x of productsInfo) {
        const result: ProductsType = {
          product: x,
          owner: data.get(x._id.toString()) || null,
          creator: x.user,
          likedByUser: false,
        };
        results.push(result);
      }
      return results;
    }
  }
  async verifyPhoneRequest(user: User, params: VerifyPhoneRequestDto) {
    // First, store the phone number in user DB
    const { phoneNumber } = params;
    await this.userModel.findByIdAndUpdate(user._id, {
      $set: {
        phone: phoneNumber,
        phone_verified: false, // In case where phone number changed
      },
    });

    // Second, create temporary token
    const otpToken = generatePhoneOtp();
    const expiresAt = new Date(
      Date.now() + PHONE_VERIFICATION_OTP_EXPIRES_MIN * 60 * 1000,
    );
    await this.temporaryTokenService.create(
      user,
      TemporaryTokenType.PHONE_VERIFICATION,
      otpToken,
      expiresAt,
    );

    // Third, send SMS
    await this.twilioService.sendVerificationSMS(phoneNumber, otpToken);
    return { created: true };
  }

  async verifyPhoneValidate(user: User, params: VerifyPhoneValidateDto) {
    const { token } = params;
    const result = await this.temporaryTokenService.validate(
      user,
      TemporaryTokenType.PHONE_VERIFICATION,
      token,
    );

    if (result) {
      // Mark phone as verified.
      await this.userModel.findByIdAndUpdate(user._id, {
        $set: {
          phone_verified: true,
        },
      });
      return { created: true };
    } else {
      throw new BadRequestException('Token does not match');
    }
  }

  async resetPasswordRequest(params: ResetPasswordRequestDto) {
    const { email } = params;
    const user = await this.findByEmail(email.toLowerCase().trim());

    // Ignore if user does not exist.
    if (!user) {
      this.logger.log('No user exists with email', email);
      return;
    }

    // Create temporary token for resetting password.
    const token = generateAlphanumeric(RESET_PASSWORD_TOKEN_LENGTH);
    const expiresAt = new Date(
      Date.now() + RESET_PASSWORD_TOKEN_EXPIRES_MIN * 60 * 1000,
    );
    await this.temporaryTokenService.create(
      user,
      TemporaryTokenType.RESET_PASSWORD,
      token,
      expiresAt,
    );

    // Send an email to reset password.
    const resetUrl = buildResetPasswordUrl(token);
    await this.emailService.sendResetPasswordEmail({
      to: user.email,
      username: user.name,
      resetUrl,
    });

    return true;
  }

  async resetPasswordTokenExists(
    token: string,
  ): Promise<TemporaryToken> | null {
    const temporaryToken = await this.temporaryTokenService.findToken(
      TemporaryTokenType.RESET_PASSWORD,
      token,
    );
    return temporaryToken;
  }

  async resetPasswordUpdate(params: ResetPasswordUpdateDto) {
    const { token, newPassword } = params;

    // TODO: Check password format

    const temporaryToken = await this.resetPasswordTokenExists(token);
    if (!temporaryToken) {
      throw new BadRequestException('Token does not exist');
    }

    // Remove all existing RESET_PASSWORD temporary tokens
    await this.temporaryTokenService.validate(
      temporaryToken.user,
      TemporaryTokenType.RESET_PASSWORD,
      token,
    );

    await this.userModel.findByIdAndUpdate(temporaryToken.user._id, {
      $set: {
        password: await hashPassword(newPassword),
      },
    });

    return true;
  }

  async updateWallet(user: User, params: UpdateWalletDto): Promise<User> {
    this.logger.log(
      'Uptading wallet for',
      user.name,
      'to',
      params.address,
      'in',
      params.blockchain,
    );
    const result = await this.userModel
      .findByIdAndUpdate(
        user._id,
        {
          $set: {
            wallet_address: params.address,
          },
        },
        {
          new: true,
        },
      )
      .exec();

    if (!result) {
      throw new InternalServerErrorException('User is not updated');
    }

    return result;
  }

  async updatePassword(user: User, params: UpdatePasswordDto) {
    const { oldPassword, newPassword } = params;

    const passwordCheck = await comparePassword(oldPassword, user.password);

    if (!passwordCheck) {
      throw new BadRequestException('Wrong password.');
    }

    // TODO: Check the password format

    return await this.userModel.findByIdAndUpdate(user, {
      $set: {
        password: await hashPassword(newPassword),
      },
    });
  }

  async updateUserProfile(
    user: User,
    params: UpdateUserProfileDto,
  ): Promise<Partial<User>> | null {
    const updateUser = await this.userModel.findByIdAndUpdate(user._id, params);

    return updateUser;
  }

  async updateUserInfo(
    user: User,
    params: UpdateUserInfoDto,
  ): Promise<Partial<User>> | null {
    const updateUser = await this.userModel.findByIdAndUpdate(user._id, params);

    return updateUser;
  }
}
