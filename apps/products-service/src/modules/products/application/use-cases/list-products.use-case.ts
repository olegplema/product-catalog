import { Inject, Injectable } from '@nestjs/common';

import {
  PRODUCT_REPOSITORY,
  type PaginatedProducts,
  type ProductRepository,
} from '../ports/product.repository';

export type ListProductsUseCaseInput = {
  page?: number;
  limit?: number;
};

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: ListProductsUseCaseInput = {}): Promise<PaginatedProducts> {
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(input.limit ?? 10)));

    return this.productRepository.findPaginated({
      page,
      limit,
    });
  }
}
