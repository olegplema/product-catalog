import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_EVENT_TYPES, type ProductCreatedEvent } from '@product-catalog/contracts';

import {
  PRODUCT_EVENT_PUBLISHER,
  type ProductEventPublisher,
} from '../ports/product-event-publisher';
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
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly productEventPublisher: ProductEventPublisher,
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<ProductEntity> {
    const product = await this.productRepository.create({
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
    });

    const event: ProductCreatedEvent = {
      eventId: randomUUID(),
      eventType: PRODUCT_EVENT_TYPES.CREATED,
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

    return product;
  }
}
