import type { ProductEvent } from '@product-catalog/contracts';

import type { ProductTransaction } from './product-transaction-manager';

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

export interface OutboxRepositoryPort {
  insert(transaction: ProductTransaction, event: ProductEvent): Promise<void>;
  processNextBatch(
    batchSize: number,
    publish: (event: ProductEvent) => Promise<void>,
  ): Promise<number>;
}
