import { Document } from 'mongoose';

export interface EnvironmentVariables {
  UPLOADS_PATH: string;
  NODE_ENV: string;

  // MongoDB connection string, starting with mongodb+srv://
  MONGODB_CONNECTION_STRING: string;

  // Port where NestJS will run
  PORT: number;

  // Pinata API related variables
  PINATA_API_KEY: string;
  PINATA_SECRET_KEY: string;

  // AWS S3 related variables for storing user-uploaded files
  S3_UPLOADER_ACCESS_KEY_ID: string;
  S3_UPLOADER_SECRET_ACCESS_KEY: string;
  S3_USER_PRODUCTS_BUCKET: string; // canverse-useruploads
  S3_USER_PROFILE_PICS_BUCKET: string; // canverse-profilepics

  // Slack alert
  SLACK_PURCHASE_ALERT_CHANNEL_ID: string;
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;
  SLACK_APP_TOKEN: string;
  SLACK_FEEDBACK_CHANNEL_I: string;

  // Twilio related variables for SMS verification
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_SENDER_NUMBER: string;

  // SendGrid API Key to send emails
  SENDGRID_API_KEY: string;
  SENDGRID_SENDER_EMAIL: string;

  // Iamport API variables
  IAMPORT_KEY: string;
  IAMPORT_SECRET: string;

  // Session secret
  JWT_SECRET: string;
  JWT_IGNORE_EXPIRATION: boolean;
  JWT_EXPIRATION: string;

  // Social login credentials
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
}

export type Filter<T> = Partial<Omit<T, '$where'>>;

export interface Repository<T extends Document> {
  findOne(filter: Filter<T>): Promise<T | null>;
  create(params: Partial<T>): Promise<T>;
}
