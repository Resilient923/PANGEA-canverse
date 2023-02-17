import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { OAuth2 } from 'oauth';
import { EnvironmentVariables } from 'src/common/types';

const OAUTH_HOST = 'https://accounts.google.com/o/oauth2/v2/auth';
const USER_PROFILE_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface Profile {
  provider: 'google';
  id: string;
  name: string;
  email: string;
  picture?: string;
  _raw: string | Buffer | undefined;
  _json: string;
}

/**
 *
 * WARNING: This strategy is not used yet.
 *
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private oauth2: OAuth2;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    super();
    this.oauth2 = new OAuth2(
      configService.get('GOOGLE_CLIENT_ID') || '',
      configService.get('GOOGLE_CLIENT_SECRET') || '',
      OAUTH_HOST,
    );
  }

  async authenticate(
    req: Request,
    _options: { session: boolean; property: string },
  ): Promise<void> {
    try {
      const { accessToken, email, googleUserId } = req.body;
      const callback = async (
        err: { statusCode: number; data?: any },
        body: string | Buffer | undefined,
      ) => {
        if (err) {
          return this.fail();
        }
        const json = body ? JSON.parse(`${body}`) : {};
        const profile: Profile = {
          provider: 'google',
          id: json.sub,
          name: json.name,
          email: json.email,
          picture: json.picture,
          _raw: body,
          _json: json,
        };

        if (!profile.id) {
          return this.fail();
        }

        if (profile.id != googleUserId || profile.email != email) {
          return this.fail();
        }
        this.success(profile);
      };

      this.oauth2.get(USER_PROFILE_URL, accessToken, callback);
    } catch (err) {
      this.fail();
    }
  }
}
