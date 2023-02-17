import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { ProductOwnersModule } from './product-owners/product-owners.module';
import { UserProductLikesModule } from './user-product-likes/user-product-likes.module';
import { EnvironmentVariables } from './common/types';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { SaleitemsModule } from './saleitems/saleitems.module';
import { SendGridModule } from '@anchan828/nest-sendgrid';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        return {
          uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
        };
      },
      inject: [ConfigService],
    }),
    SendGridModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        return {
          apikey: configService.get<string>('SENDGRID_API_KEY'),
        };
      },
      inject: [ConfigService],
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        return {
          accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
          authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ExhibitionsModule,
    PaymentsModule,
    ProductsModule,
    ProductOwnersModule,
    UserProductLikesModule,
    ExhibitionsModule,
    ExhibitionsModule,
    SaleitemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
