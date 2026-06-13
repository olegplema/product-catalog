import type { ProductEvent } from '@product-catalog/contracts';

export const PRODUCT_EVENT_PUBLISHER = Symbol('PRODUCT_EVENT_PUBLISHER');

export type ProductEventMessage = ProductEvent;

export interface ProductEventPublisher {
  publish(message: ProductEventMessage): Promise<void>;
}
