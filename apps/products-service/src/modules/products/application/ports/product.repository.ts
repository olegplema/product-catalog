import type { ProductEntity } from '../../domain/product.entity';
import type { ProductTransaction } from './product-transaction-manager';

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
  create(input: CreateProductInput, transaction?: ProductTransaction): Promise<ProductEntity>;
  findById(id: string, transaction?: ProductTransaction): Promise<ProductEntity | null>;
  findPaginated(input: ListProductsInput): Promise<PaginatedProducts>;
  softDelete(id: string, transaction?: ProductTransaction): Promise<boolean>;
}
