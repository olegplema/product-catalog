import { Inject, Injectable } from '@nestjs/common';

import type { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export type ListProductsUseCaseInput = {
  page?: number;
  limit?: number;
};

export type ListProductsUseCaseResult = {
  items: ProductEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: ListProductsUseCaseInput = {}): Promise<ListProductsUseCaseResult> {
    const page = Math.max(DEFAULT_PAGE, Math.floor(input.page ?? DEFAULT_PAGE));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(input.limit ?? DEFAULT_LIMIT)));

    const result = await this.productRepository.findPaginated({
      page,
      limit,
    });

    return {
      items: result.items,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
