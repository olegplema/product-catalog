import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

import { IsPriceWithinIntRange } from '../validators/is-price-within-int-range.validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'price must be a valid dollar amount with up to 2 decimal places',
  })
  @IsPriceWithinIntRange()
  price!: string;
}
