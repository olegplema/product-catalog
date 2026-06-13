import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

import { MAX_PRICE_CENTS } from '../price.constants';
import {
  assertPriceCentsFitsInt,
  formatPriceFromCents,
  parsePriceToCentsBigInt,
} from '../price.mapper';

export function IsPriceWithinIntRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isPriceWithinIntRange',
      target: object.constructor,
      propertyName,
      ...(validationOptions === undefined ? {} : { options: validationOptions }),
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const priceCents = parsePriceToCentsBigInt(value);

            assertPriceCentsFitsInt(priceCents);

            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(_args: ValidationArguments): string {
          return `price must not exceed ${formatPriceFromCents(MAX_PRICE_CENTS)}`;
        },
      },
    });
  };
}
