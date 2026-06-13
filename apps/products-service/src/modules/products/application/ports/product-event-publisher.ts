export const PRODUCT_EVENT_PUBLISHER = Symbol('PRODUCT_EVENT_PUBLISHER');

export type ProductEventMessage = Record<string, unknown>;

export interface ProductEventPublisher {
  publish(message: ProductEventMessage): Promise<void>;
}
