import {
  PRODUCT_EVENT_TYPES,
  type ProductCreatedEvent,
  type ProductDeletedEvent,
  type ProductEvent,
} from '@product-catalog/contracts';

type UnknownRecord = Record<string, unknown>;

export function parseProductEvent(value: unknown): ProductEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.eventType === PRODUCT_EVENT_TYPES.CREATED) {
    return parseProductCreatedEvent(value);
  }

  if (value.eventType === PRODUCT_EVENT_TYPES.DELETED) {
    return parseProductDeletedEvent(value);
  }

  return null;
}

function parseProductCreatedEvent(value: UnknownRecord): ProductCreatedEvent | null {
  if (!isBaseProductEvent(value, PRODUCT_EVENT_TYPES.CREATED)) {
    return null;
  }

  const data = value.data;

  if (!isProductEventData(data)) {
    return null;
  }

  return {
    eventId: value.eventId,
    eventType: PRODUCT_EVENT_TYPES.CREATED,
    occurredAt: value.occurredAt,
    version: 1,
    data,
  };
}

function parseProductDeletedEvent(value: UnknownRecord): ProductDeletedEvent | null {
  if (!isBaseProductEvent(value, PRODUCT_EVENT_TYPES.DELETED)) {
    return null;
  }

  const data = value.data;

  if (!isProductEventData(data)) {
    return null;
  }

  return {
    eventId: value.eventId,
    eventType: PRODUCT_EVENT_TYPES.DELETED,
    occurredAt: value.occurredAt,
    version: 1,
    data,
  };
}

function isBaseProductEvent(
  value: UnknownRecord,
  eventType: ProductEvent['eventType'],
): value is UnknownRecord & {
  eventId: string;
  eventType: ProductEvent['eventType'];
  occurredAt: string;
  version: 1;
} {
  return (
    value.eventType === eventType &&
    typeof value.eventId === 'string' &&
    value.eventId.length > 0 &&
    typeof value.occurredAt === 'string' &&
    value.occurredAt.length > 0 &&
    value.version === 1
  );
}

function isProductEventData(value: unknown): value is ProductEvent['data'] {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    (value.description === null || typeof value.description === 'string') &&
    typeof value.priceCents === 'number' &&
    Number.isInteger(value.priceCents) &&
    value.priceCents >= 0
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
