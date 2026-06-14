import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { ProductOutboxPublisherWorker } from './adapters/outbound/messaging/product-outbox.publisher-worker';
import { SqsProductEventPublisher } from './adapters/outbound/messaging/sqs-product-event.publisher';
import { OutboxRepository } from './adapters/outbound/persistence/prisma-outbox.repository';
import { PrismaProductMutationRepository } from './adapters/outbound/persistence/prisma-product-mutation.repository';
import { PrismaProductRepository } from './adapters/outbound/persistence/prisma-product.repository';
import { PRODUCT_MUTATION_REPOSITORY } from './application/ports/product-mutation.repository';
import { PRODUCT_EVENT_PUBLISHER } from './application/ports/product-event-publisher';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { ProductsController } from './adapters/inbound/http/products.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    DeleteProductUseCase,
    ListProductsUseCase,
    OutboxRepository,
    ProductOutboxPublisherWorker,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: PRODUCT_MUTATION_REPOSITORY,
      useClass: PrismaProductMutationRepository,
    },
    {
      provide: PRODUCT_EVENT_PUBLISHER,
      useClass: SqsProductEventPublisher,
    },
  ],
})
export class ProductsModule {}
