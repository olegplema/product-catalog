import { randomUUID } from 'node:crypto';

import {
  PRODUCT_EVENT_TYPES,
  type ProductCreatedEvent,
  type ProductDeletedEvent,
} from '@product-catalog/contracts';

import type { ProductEntity } from '../../domain/product.entity';

export function toProductCreatedEvent(product: ProductEntity): ProductCreatedEvent {
  return {
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
}

export function toProductDeletedEvent(product: ProductEntity): ProductDeletedEvent {
  return {
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
}
