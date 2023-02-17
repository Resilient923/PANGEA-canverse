import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from 'src/common/types';
import { JwtPayload } from './types';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configService.get('JWT_IGNORE_EXPIRATION'),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException(payload.sub);
    }
    return user;
  }
}
