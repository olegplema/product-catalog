import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaProductRepository } from './adapters/outbound/persistence/prisma-product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';

@Module({
  imports: [PrismaModule],
  providers: [
    CreateProductUseCase,
    DeleteProductUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class ProductsModule {}
