import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @ApiProperty({ description: 'Old password' })
  oldPassword: string;

  @IsString()
  @ApiProperty({ description: 'New password' })
  newPassword: string;
}
