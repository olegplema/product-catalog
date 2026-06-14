import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import {
  PRODUCT_EVENT_TYPES,
  type ProductCreatedEvent,
  type ProductDeletedEvent,
} from '@product-catalog/contracts';

import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import type {
  CreateProductCommand,
  DeleteProductResult,
  ProductMutationRepository,
} from '../../../application/ports/product-mutation.repository';
import type { ProductEntity } from '../../../domain/product.entity';
import { OutboxRepository } from './prisma-outbox.repository';

type PrismaProductRecord = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class PrismaProductMutationRepository implements ProductMutationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async createProduct(input: CreateProductCommand): Promise<ProductEntity> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          priceCents: input.priceCents,
        },
      });

      const event: ProductCreatedEvent = {
        eventId: randomUUID(),
        eventType: PRODUCT_EVENT_TYPES.CREATED,
        occurredAt: new Date().toISOString(),
        version: 1,
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
        },
      };

      await this.outboxRepository.insert(tx, event);

      return this.toEntity(product);
    });
  }

  async deleteProduct(id: string): Promise<DeleteProductResult> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id,
        },
      });

      if (!product) {
        return {
          status: 'not_found',
        };
      }

      if (product.deletedAt !== null) {
        return {
          status: 'already_deleted',
        };
      }

      const deleted = await tx.product.updateMany({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (deleted.count === 0) {
        return {
          status: 'already_deleted',
        };
      }

      const event: ProductDeletedEvent = {
        eventId: randomUUID(),
        eventType: PRODUCT_EVENT_TYPES.DELETED,
        occurredAt: new Date().toISOString(),
        version: 1,
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
        },
      };

      await this.outboxRepository.insert(tx, event);

      return {
        status: 'deleted',
      };
    });
  }

  private toEntity(product: PrismaProductRecord): ProductEntity {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }
}
