import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

// Default is 10, which means that the password is encrypted 2^10=1024 times.
const BCRYPT_COST_FACTOR = 10;

export async function hashPassword(password: string) {
  return await hash(password, BCRYPT_COST_FACTOR);
}

export async function comparePassword(
  plainText: string,
  hashedPassword: string,
) {
  return await compare(plainText, hashedPassword);
}

export async function getNewPassword(length = 12) {
  return randomBytes(Math.floor((length * 3) / 4))
    .toString('base64')
    .replace(/(\+)/g, '-')
    .replace(/(\/)/g, '_')
    .replace(/(\=)/g, '');
}
