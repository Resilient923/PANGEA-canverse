import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  @IsOptional()
  bank: string;
  @IsString()
  @IsOptional()
  bank_account_number: string;
  @IsString()
  @IsOptional()
  country: string;
  @IsString()
  @IsOptional()
  address_level_1: string;
  @IsString()
  @IsOptional()
  address_level_2: string;
}
