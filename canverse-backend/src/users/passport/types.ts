export type AccessToken = {
  accessToken: string;
  _id: string;
  name: string;
  email: string;
  profileImageUrl: string;
};

export type JwtPayload = { email: string; name: string; sub: string };

export type VerificationType = 'email' | 'phone';
