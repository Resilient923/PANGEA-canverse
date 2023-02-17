import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';

export enum UserType {
  PREVIEW = 'PREVIEW',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name!: string;

  @Prop()
  email!: string;

  @Prop()
  password!: string;

  @Prop()
  bio: string;

  @Prop()
  profile_img_path: string;

  @Prop({ type: String, enum: Object.keys(UserType), default: UserType.USER })
  user_type!: string;

  @Prop({ type: Date, default: Date.now })
  register_date!: Date;

  @Prop({
    type: String,
    enum: Object.keys(UserStatus),
    default: UserStatus.ACTIVE,
  })
  status: string;

  @Prop()
  insta: string;

  @Prop()
  facebook: string;

  @Prop()
  twitter: string;

  @Prop()
  portfolio_website: string;

  @Prop()
  phone: string;

  @Prop({ type: Boolean, default: false })
  email_verified: boolean;

  @Prop({ type: Boolean, default: false })
  phone_verified: boolean;

  @Prop()
  wallet_address: string;

  @Prop()
  country: string;

  @Prop()
  description1: string;

  @Prop()
  description2: string;

  @Prop()
  address_level_1: string;

  @Prop()
  address_level_2: string;

  @Prop()
  postal_code: string;

  @Prop()
  bank: string;

  @Prop()
  bank_account_number: string;

  @Prop()
  googleUserId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
