import { Inject, Injectable } from '@nestjs/common';

import { ProductNotFoundError } from '../errors/product-not-found.error';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';

export type DeleteProductInput = {
  id: string;
};

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const deleted = await this.productRepository.softDelete(input.id);

    if (!deleted) {
      throw new ProductNotFoundError(input.id);
    }
  }
}
