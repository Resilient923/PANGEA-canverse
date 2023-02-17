import { randomInt } from 'crypto';

const DIGITS = '0123456789';
const LOWERCASES = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASES = LOWERCASES.toUpperCase();

export function generateAlphanumeric(length: number) {
  const items = (DIGITS + LOWERCASES + UPPERCASES).split('');
  const selected: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = randomInt(items.length);
    selected.push(items[randomIndex]);
  }
  return selected.join('');
}
