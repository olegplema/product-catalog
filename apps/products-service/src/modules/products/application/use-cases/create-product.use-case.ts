import { Inject, Injectable } from '@nestjs/common';

import type { ProductEntity } from '../../domain/product.entity';
import {
  PRODUCT_MUTATION_REPOSITORY,
  type ProductMutationRepository,
} from '../ports/product-mutation.repository';

export type CreateProductUseCaseInput = {
  name: string;
  description?: string | null;
  priceCents: number;
};

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_MUTATION_REPOSITORY)
    private readonly productMutationRepository: ProductMutationRepository,
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<ProductEntity> {
    return this.productMutationRepository.createProduct(input);
  }
}
