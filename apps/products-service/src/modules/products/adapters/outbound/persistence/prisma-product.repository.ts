import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import type {
  CreateProductInput,
  ListProductsInput,
  PaginatedProducts,
  ProductRepository,
} from '../../../application/ports/product.repository';
import type { ProductEntity } from '../../../domain/product.entity';

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
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateProductInput): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
      },
    });

    return this.toEntity(product);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
      },
    });

    return product ? this.toEntity(product) : null;
  }

  async findPaginated(input: ListProductsInput): Promise<PaginatedProducts> {
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: input.limit,
      }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.prisma.product.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
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
