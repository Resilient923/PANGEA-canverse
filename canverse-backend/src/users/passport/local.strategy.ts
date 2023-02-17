import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmailAndPassword(
      email,
      password,
    );
    return user;
  }
}
