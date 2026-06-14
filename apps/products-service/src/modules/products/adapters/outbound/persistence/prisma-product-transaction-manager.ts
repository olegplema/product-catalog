import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import type {
  ProductTransaction,
  ProductTransactionManager,
} from '../../../application/ports/product-transaction-manager';

@Injectable()
export class PrismaProductTransactionManager implements ProductTransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(callback: (transaction: ProductTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (transaction) => callback(transaction));
  }
}
