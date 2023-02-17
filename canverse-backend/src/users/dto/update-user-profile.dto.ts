import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  profile_img_path: string;

  @IsString()
  @IsOptional()
  description1: string;

  @IsString()
  @IsOptional()
  description2: string;

  @IsString()
  @IsOptional()
  insta: string;

  @IsString()
  @IsOptional()
  twitter: string;

  @IsString()
  @IsOptional()
  facebook: string;

  @IsString()
  @IsOptional()
  portfolio_website: string;
}
