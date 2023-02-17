import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
  IsOptional,
  IsString,
} from 'class-validator';

// Supported blockchain names
export enum BlockchainName {
  ETHEREUM = 'ETHEREUM',
}

export class UpdateWalletDto {
  @IsString()
  @IsOptional()
  @IsEnum(BlockchainName)
  @ApiProperty({ description: 'Blockchain name', required: false })
  blockchain?: string; // TODO: This is needed when we support non-ethereum wallets.

  @IsString()
  @IsEthereumAddress() // TODO: This does not validate checksum
  @ApiProperty({ description: 'Blockchain wallet address' })
  address: string;
}
