import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { EnvironmentVariables } from 'src/common/types';
import { UploadFilePinata } from 'src/products/dto/products.dto';

@Injectable()
export class PinataService {
  private readonly pinata;
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    private readonly logger: Logger,
  ) {
    const pinataClient = require('@pinata/sdk');

    this.pinata = pinataClient(
      configService.get<string>('PINATA_API_KEY'),
      configService.get<string>('PINATA_SECRET_KEY'),
    );
  }
  async uploadFile(uploadFileDto: UploadFilePinata) {
    const { readableStream, pinataMetadata, pinataOptions } = uploadFileDto;
    try {
      const options = { pinataMetadata, pinataOptions };
      const result = await this.pinata.pinFileToIPFS(readableStream, options);
      return result.IpfsHash;
    } catch (err) {
      throw err;
    }
  }

  async uploadJson(uploadFileDto: UploadFilePinata) {
    const { readableStream, pinataMetadata, pinataOptions } = uploadFileDto;
    try {
      //   const options = { pinataMetadata, pinataOptions };
      const result = await this.pinata.pinJSONToIPFS(readableStream);
      return result.IpfsHash;
    } catch (err) {
      throw err;
    }
  }
}
