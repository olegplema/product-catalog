import { MAX_PRICE_CENTS } from './price.constants';
import { InvalidPriceError } from './errors/invalid-price.error';

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parsePriceToCentsBigInt(price: string): bigint {
  if (!PRICE_PATTERN.test(price)) {
    throw new InvalidPriceError('price must be a valid dollar amount with up to 2 decimal places');
  }

  const [dollarsPart = '0', centsPart = ''] = price.split('.');
  const normalizedCents = centsPart.padEnd(2, '0');

  return BigInt(dollarsPart) * 100n + BigInt(normalizedCents);
}

export function assertPriceCentsFitsInt(priceCents: bigint): void {
  if (priceCents > BigInt(MAX_PRICE_CENTS)) {
    throw new InvalidPriceError(`price must not exceed ${formatPriceFromCents(MAX_PRICE_CENTS)}`);
  }
}

export function parsePriceToCents(price: string): number {
  const priceCents = parsePriceToCentsBigInt(price);

  assertPriceCentsFitsInt(priceCents);

  return Number(priceCents);
}

export function formatPriceFromCents(priceCents: number): string {
  const dollars = Math.floor(priceCents / 100);
  const cents = String(priceCents % 100).padStart(2, '0');

  return `${String(dollars)}.${cents}`;
}
