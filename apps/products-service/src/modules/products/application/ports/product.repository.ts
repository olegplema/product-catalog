import type { ProductEntity } from '../../domain/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export type CreateProductInput = {
  name: string;
  description: string | null;
  priceCents: number;
};

export type ListProductsInput = {
  page: number;
  limit: number;
};

export type PaginatedProducts = {
  items: ProductEntity[];
  total: number;
};

export interface ProductRepository {
  create(input: CreateProductInput): Promise<ProductEntity>;
  findPaginated(input: ListProductsInput): Promise<PaginatedProducts>;
  softDelete(id: string): Promise<boolean>;
}
