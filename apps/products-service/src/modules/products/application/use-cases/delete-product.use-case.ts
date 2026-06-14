import { Inject, Injectable } from '@nestjs/common';

import { ProductNotFoundError } from '../errors/product-not-found.error';
import {
  PRODUCT_MUTATION_REPOSITORY,
  type ProductMutationRepository,
} from '../ports/product-mutation.repository';

export type DeleteProductInput = {
  id: string;
};

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_MUTATION_REPOSITORY)
    private readonly productMutationRepository: ProductMutationRepository,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const result = await this.productMutationRepository.deleteProduct(input.id);

    if (result.status === 'not_found') {
      throw new ProductNotFoundError(input.id);
    }

    if (result.status === 'already_deleted') {
      return;
    }
  }
}
