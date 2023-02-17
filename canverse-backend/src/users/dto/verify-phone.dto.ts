import { IsPhoneNumber, IsString } from 'class-validator';

export class VerifyPhoneRequestDto {
  @IsPhoneNumber()
  readonly phoneNumber: string;
}

export class VerifyPhoneValidateDto {
  @IsString()
  readonly token: string;
}
