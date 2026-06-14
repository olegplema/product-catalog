import { Injectable, Logger } from '@nestjs/common';
import { PRODUCT_EVENT_TYPES, type ProductEvent } from '@product-catalog/contracts';

@Injectable()
export class HandleProductEventUseCase {
  private readonly logger = new Logger(HandleProductEventUseCase.name);

  execute(event: ProductEvent): void {
    switch (event.eventType) {
      case PRODUCT_EVENT_TYPES.CREATED:
        this.handleProductCreated(event);
        return;

      case PRODUCT_EVENT_TYPES.DELETED:
        this.handleProductDeleted(event);
        return;
    }
  }

  private handleProductCreated(
    event: Extract<ProductEvent, { eventType: typeof PRODUCT_EVENT_TYPES.CREATED }>,
  ): void {
    this.logger.log(
      [
        `Received product.created eventId=${event.eventId}`,
        `productId=${event.data.id}`,
        `name=${event.data.name}`,
        `priceCents=${event.data.priceCents}`,
        `occurredAt=${event.occurredAt}`,
      ].join(' '),
    );
  }

  private handleProductDeleted(
    event: Extract<ProductEvent, { eventType: typeof PRODUCT_EVENT_TYPES.DELETED }>,
  ): void {
    this.logger.log(
      [
        `Received product.deleted eventId=${event.eventId}`,
        `productId=${event.data.id}`,
        `name=${event.data.name}`,
        `priceCents=${event.data.priceCents}`,
        `occurredAt=${event.occurredAt}`,
      ].join(' '),
    );
  }
}
