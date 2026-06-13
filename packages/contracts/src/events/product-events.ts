export type ProductCreatedEvent = {
  eventId: string;
  eventType: 'product.created';
  occurredAt: string;
  version: 1;
  data: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
  };
};

export type ProductDeletedEvent = {
  eventId: string;
  eventType: 'product.deleted';
  occurredAt: string;
  version: 1;
  data: {
    id: string;
  };
};

export type ProductEvent = ProductCreatedEvent | ProductDeletedEvent;
