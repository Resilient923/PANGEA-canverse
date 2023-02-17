import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, Document } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

const {
  Types: { ObjectId },
} = mongooseSchema;

// All temporary tokens are deleted from DB in 24 hours. They should expire before then.
const MAX_LIFE_IN_SECONDS = 60 * 60 * 24;

export enum TemporaryTokenType {
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

/**
 * Storage for temporary tokens for different purposes, like OTPs.
 */
@Schema({ collection: 'temporarytokens', timestamps: true })
export class TemporaryToken extends Document {
  @Prop({ type: ObjectId, ref: 'User', required: true })
  user!: User;

  @Prop({ type: String, enum: Object.keys(TemporaryTokenType), required: true })
  tokenType!: string;

  @Prop({ type: String, required: true })
  token!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;
}

export const TemporaryTokenSchema =
  SchemaFactory.createForClass(TemporaryToken);

TemporaryTokenSchema.index({ user: 1, tokenType: 1 });
TemporaryTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: MAX_LIFE_IN_SECONDS },
);
