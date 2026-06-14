import { Inject, Injectable } from '@nestjs/common';

import { ProductNotFoundError } from '../errors/product-not-found.error';
import { OUTBOX_REPOSITORY, type OutboxRepositoryPort } from '../ports/outbox.repository';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';
import {
  PRODUCT_TRANSACTION_MANAGER,
  type ProductTransactionManager,
} from '../ports/product-transaction-manager';
import { toProductDeletedEvent } from '../services/product-event.factory';

export type DeleteProductInput = {
  id: string;
};

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: OutboxRepositoryPort,
    @Inject(PRODUCT_TRANSACTION_MANAGER)
    private readonly productTransactionManager: ProductTransactionManager,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    await this.productTransactionManager.runInTransaction(async (transaction) => {
      const product = await this.productRepository.findById(input.id, transaction);

      if (!product) {
        throw new ProductNotFoundError(input.id);
      }

      if (product.deletedAt !== null) {
        return;
      }

      const deleted = await this.productRepository.softDelete(input.id, transaction);

      if (!deleted) {
        return;
      }

      await this.outboxRepository.insert(transaction, toProductDeletedEvent(product));
    });
  }
}
