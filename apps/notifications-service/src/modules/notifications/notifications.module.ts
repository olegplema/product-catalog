import { Module } from '@nestjs/common';

import { SqsProductEventsConsumer } from './adapters/inbound/messaging/sqs-product-events.consumer';
import { HandleProductEventUseCase } from './application/use-cases/handle-product-event.use-case';

@Module({
  providers: [HandleProductEventUseCase, SqsProductEventsConsumer],
})
export class NotificationsModule {}
