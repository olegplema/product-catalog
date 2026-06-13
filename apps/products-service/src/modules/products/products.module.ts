import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaProductRepository } from './adapters/outbound/persistence/prisma-product.repository';
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
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class ProductsModule {}
