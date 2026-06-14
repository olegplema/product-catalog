import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { ProductOutboxPublisherWorker } from './adapters/outbound/messaging/product-outbox.publisher-worker';
import { PrismaIdempotencyRepository } from './adapters/outbound/persistence/prisma-idempotency.repository';
import { SqsProductEventPublisher } from './adapters/outbound/messaging/sqs-product-event.publisher';
import { OutboxRepository } from './adapters/outbound/persistence/prisma-outbox.repository';
import { PrismaProductRepository } from './adapters/outbound/persistence/prisma-product.repository';
import { PrismaProductTransactionManager } from './adapters/outbound/persistence/prisma-product-transaction-manager';
import { IDEMPOTENCY_REPOSITORY } from './application/ports/idempotency.repository';
import { PRODUCT_EVENT_PUBLISHER } from './application/ports/product-event-publisher';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository';
import { PRODUCT_TRANSACTION_MANAGER } from './application/ports/product-transaction-manager';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { OUTBOX_REPOSITORY } from './application/ports/outbox.repository';
import { ProductsController } from './adapters/inbound/http/products.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    DeleteProductUseCase,
    ListProductsUseCase,
    OutboxRepository,
    PrismaIdempotencyRepository,
    PrismaProductTransactionManager,
    ProductOutboxPublisherWorker,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: OUTBOX_REPOSITORY,
      useExisting: OutboxRepository,
    },
    {
      provide: IDEMPOTENCY_REPOSITORY,
      useExisting: PrismaIdempotencyRepository,
    },
    {
      provide: PRODUCT_TRANSACTION_MANAGER,
      useExisting: PrismaProductTransactionManager,
    },
    {
      provide: PRODUCT_EVENT_PUBLISHER,
      useClass: SqsProductEventPublisher,
    },
  ],
})
export class ProductsModule {}
