import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TemporaryToken,
  TemporaryTokenType,
} from './entities/temporary-tokens.entity';
import { User } from './entities/user.entity';

@Injectable()
export class TemporaryTokensService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(TemporaryToken.name)
    private temporaryTokenModel: Model<TemporaryToken>,
    private readonly logger: Logger,
  ) {}

  async create(
    user: User,
    tokenType: TemporaryTokenType,
    token: string,
    expiresAt: Date,
  ): Promise<TemporaryToken> {
    this.logger.log(
      `Creating a temporary token for ${user.email}:, ${tokenType}, ${token}, ${expiresAt}`,
    );
    const temporaryToken = await this.temporaryTokenModel.create({
      user,
      tokenType,
      token,
      expiresAt,
    });
    return temporaryToken;
  }

  async findToken(
    tokenType: TemporaryTokenType,
    token: string,
    expiresAfter?: Date,
  ): Promise<TemporaryToken> | null {
    const result = await this.temporaryTokenModel
      .findOne({
        tokenType,
        token,
        expiresAt: { $gt: expiresAfter ?? Date.now() },
      })
      .exec();
    return result;
  }

  // Find an unexpired temporary token of a specific type for a user
  async validate(
    user: User,
    tokenType: TemporaryTokenType,
    token: string,
    expiresAfter?: Date,
  ) {
    const results = await this.temporaryTokenModel
      .find({
        user,
        tokenType,
        token,
        expiresAt: { $gt: expiresAfter ?? Date.now() },
      })
      .exec();
    if (results.length) {
      // Delete all existing temporary tokens if used for verification
      await this.temporaryTokenModel.deleteMany({ user, tokenType });
      return true;
    }
    return false;
  }
}
