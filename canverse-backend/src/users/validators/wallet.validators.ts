import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ethers } from 'ethers';

// TODO: This class is not used yet
export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsEthereumAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'string' && ethers.utils.isAddress(value as string)
          );
        },
      },
    });
  };
}
