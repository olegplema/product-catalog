import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_EVENT_TYPES, type ProductDeletedEvent } from '@product-catalog/contracts';

import { ProductNotFoundError } from '../errors/product-not-found.error';
import {
  PRODUCT_EVENT_PUBLISHER,
  type ProductEventPublisher,
} from '../ports/product-event-publisher';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';

export type DeleteProductInput = {
  id: string;
};

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly productEventPublisher: ProductEventPublisher,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new ProductNotFoundError(input.id);
    }

    if (product.deletedAt !== null) {
      return;
    }

    const deleted = await this.productRepository.softDelete(input.id);

    if (!deleted) {
      return;
    }

    const event: ProductDeletedEvent = {
      eventId: randomUUID(),
      eventType: PRODUCT_EVENT_TYPES.DELETED,
      occurredAt: new Date().toISOString(),
      version: 1,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
      },
    };

    await this.productEventPublisher.publish(event);
  }
}
