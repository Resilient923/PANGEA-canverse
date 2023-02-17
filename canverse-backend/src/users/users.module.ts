import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserLocalStrategy } from './passport/local.strategy';
import { GoogleStrategy } from './passport/google.strategy';
import { KakaoStrategy } from './passport/kakao.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { OptionalJwtStrategy } from './passport/optional.jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';
import { Product, ProductSchema } from 'src/products/entities/products.entity';
import {
  SaleItem,
  SaleItemSchema,
} from 'src/saleitems/entities/saleitems.entity';
import {
  ProductOwner,
  ProductOwnerSchema,
} from 'src/product-owners/entities/product-owners.entity';
import {
  TemporaryToken,
  TemporaryTokenSchema,
} from './entities/temporary-tokens.entity';
import { TemporaryTokensService } from './temporary-tokens.service';
import { TwilioService } from 'src/client/twilio.service';
import { SendgridEmailService } from 'src/client/sendgrid.service';
import {
  UserProductLike,
  UserProductLikeSchema,
} from 'src/user-product-likes/entities/user-product-like.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: ProductOwner.name, schema: ProductOwnerSchema },
      { name: TemporaryToken.name, schema: TemporaryTokenSchema },
      { name: UserProductLike.name, schema: UserProductLikeSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TemporaryTokensService,
    TwilioService,
    SendgridEmailService,
    Logger,
    UserLocalStrategy,
    GoogleStrategy,
    //KakaoStrategy,
    JwtStrategy,
    OptionalJwtStrategy,
  ],
})
export class UsersModule {}
