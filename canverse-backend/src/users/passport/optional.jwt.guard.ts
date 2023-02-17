import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('optional_jwt') {
  handleRequest<User>(err: any, user: User | boolean, info: any) {
    // no error is thrown if no user is found
    // You can use info for logging (e.g. token is expired etc.)
    // e.g.: if (info instanceof TokenExpiredError) ...

    if (user === false) return null;
    return user;
  }
}
