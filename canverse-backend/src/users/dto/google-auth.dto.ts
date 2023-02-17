import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'retreived google accessToken' })
  accessToken!: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'google account email' })
  email!: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'google account name' })
  name!: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'google account id' })
  googleUserId!: string;
}
