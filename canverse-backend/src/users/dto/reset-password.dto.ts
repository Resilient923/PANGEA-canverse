import {
  IsAlphanumeric,
  IsEmail,
  IsLowercase,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordRequestDto {
  @IsString()
  @IsLowercase({ message: 'Email should be lowercase' })
  @IsEmail()
  email: string;
}

export class ResetPasswordTokenExistsDto {
  @IsString()
  @IsAlphanumeric()
  @MinLength(10)
  token: string; // Token string is part of the reset password URL link
}

export class ResetPasswordUpdateDto extends ResetPasswordTokenExistsDto {
  @IsString()
  @MinLength(8)
  newPassword: string;
}
