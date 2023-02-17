import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as oauth2 from 'passport-oauth2';
import { EnvironmentVariables } from 'src/common/types';

const OAUTH_HOST = 'https://kauth.kakao.com';
const USER_PROFILE_URL = 'https://kapi.kakao.com/v2/user/me';

interface StrategyOptions extends oauth2.StrategyOptions {
  userAgent?: string;
  userProfileURL?: string;
}

export interface Profile {
  provider: 'kakao';
  id?: string;
  username?: string;
  displayName?: string;
  _raw: string | Buffer | undefined;
  _json: string;
}

const buildOptions = (options: StrategyOptions): StrategyOptions => {
  options.authorizationURL = `${OAUTH_HOST}/oauth/authorize`;
  options.tokenURL = `${OAUTH_HOST}/oauth/token`;

  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['user-agent']) {
    options.customHeaders['user-agent'] = options.userAgent || 'passport-kakao';
  }

  return options;
};

class Strategy extends oauth2.Strategy {
  private _userProfileURL: string;

  constructor(options: StrategyOptions, verify: oauth2.VerifyFunction) {
    super(buildOptions(options), verify);

    this.name = 'kakao';
    this._userProfileURL = options.userProfileURL || USER_PROFILE_URL;
  }

  userProfile(
    accessToken: string,
    done: (error: Error | null, profile?: Profile) => void,
  ): void {
    const callback = (
      err: { statusCode: number; data?: any },
      body: string | Buffer | undefined,
    ) => {
      if (err) {
        return done(
          Error(
            `Error while getting kakao user profile: ${err.statusCode} ${err.data}`,
          ),
        );
      }

      try {
        const json = body ? JSON.parse(`${body}`) : {};
        const properties = json.properties || {
          nickname: '미연동 계정',
        };
        const profile: Profile = {
          provider: 'kakao',
          id: json.id,
          username: properties.nickname,
          displayName: properties.nickname,
          _raw: body,
          _json: json,
        };
        return done(null, profile);
      } catch (e) {
        return done(e as Error);
      }
    };

    this._oauth2.get(this._userProfileURL, accessToken, callback);
  }
}

/**
 *
 * WARNING: This strategy is not used yet.
 *
 */
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService<EnvironmentVariables>) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
      callbackURL: '/users/kakao/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, profile?: Express.User) => void,
  ): Promise<void> {
    const { id, username, provider } = profile;
    if (!id || !username) {
      return done(null, undefined);
    }

    const user = {
      id: id,
      provider: provider,
      name: username,
      email: '',
      accessToken,
    };
    done(null, user);
  }
}
