import { IsEmail, IsString } from 'class-validator';

export class SignupWithEmailDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string; // TODO: Check password format
}
