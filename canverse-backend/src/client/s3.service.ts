import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// TODO: Right now this is hardcoded to Seoul region.
const S3_BUCKET_REGION = 'ap-northeast-2';

// This is copied from AWS S3 SDK.
type ObjectBodyType = string | ReadableStream<any> | Blob | Uint8Array | Buffer;

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly productsBucket: string;
  private readonly profilePicsBucket: string;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    this.client = new S3Client({
      region: S3_BUCKET_REGION,
      credentials: {
        accessKeyId: configService.get<string>('S3_UPLOADER_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>(
          'S3_UPLOADER_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.productsBucket = configService.get<string>('S3_USER_PRODUCTS_BUCKET');
    this.profilePicsBucket = configService.get<string>(
      'S3_USER_PROFILE_PICS_BUCKET',
    );
  }

  async uploadToS3(bucket: string, objectKey: string, data: ObjectBodyType) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: data,
    });
    return await this.client.send(command);
  }

  async uploadProduct(objectKey: string, data: ObjectBodyType) {
    return this.uploadToS3(this.productsBucket, objectKey, data);
  }

  async uploadThumbnail(objectKey: string, data: ObjectBodyType) {
    return this.uploadToS3(this.productsBucket, objectKey, data);
  }

  async uploadProfilePic(objectKey: string, data: ObjectBodyType) {
    return this.uploadToS3(this.profilePicsBucket, objectKey, data);
  }
}
