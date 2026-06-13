import { Inject, Injectable } from '@nestjs/common';

import type { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';

export type CreateProductUseCaseInput = {
  name: string;
  description?: string | null;
  priceCents: number;
};

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<ProductEntity> {
    return this.productRepository.create({
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
    });
  }
}
