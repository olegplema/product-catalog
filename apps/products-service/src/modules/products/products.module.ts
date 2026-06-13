import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaProductRepository } from './adapters/outbound/persistence/prisma-product.repository';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class ProductsModule {}
