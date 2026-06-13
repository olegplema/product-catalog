export const PRODUCT_EVENT_TYPES = {
  CREATED: 'product.created',
  DELETED: 'product.deleted',
} as const;

export type ProductEventData = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

export type ProductCreatedEvent = {
  eventId: string;
  eventType: typeof PRODUCT_EVENT_TYPES.CREATED;
  occurredAt: string;
  version: 1;
  data: ProductEventData;
};

export type ProductDeletedEvent = {
  eventId: string;
  eventType: typeof PRODUCT_EVENT_TYPES.DELETED;
  occurredAt: string;
  version: 1;
  data: ProductEventData;
};

export type ProductEvent = ProductCreatedEvent | ProductDeletedEvent;
