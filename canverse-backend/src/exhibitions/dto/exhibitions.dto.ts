import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ExhibitionStatus, ExhibitionType, ExhibitionOrder } from '../types';

export class ExhibitionFilterDto {
  @IsString()
  @IsOptional()
  @IsEnum(ExhibitionType)
  exhibitionType: string;

  @IsString()
  @IsOptional()
  @IsEnum(ExhibitionStatus)
  status: string;

  @IsArray()
  @IsOptional()
  ids: string[];

  @IsString()
  @IsOptional()
  @IsEnum(ExhibitionOrder)
  order: string;
}

export class ExhibitionTypeFilterDto {
  @IsString()
  @IsEnum(ExhibitionType)
  exhibitionType: string;
}
