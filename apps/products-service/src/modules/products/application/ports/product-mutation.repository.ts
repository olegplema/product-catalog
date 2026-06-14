import type { ProductEntity } from '../../domain/product.entity';

export const PRODUCT_MUTATION_REPOSITORY = Symbol('PRODUCT_MUTATION_REPOSITORY');

export type CreateProductCommand = {
  name: string;
  description?: string | null;
  priceCents: number;
};

export type DeleteProductResult =
  | {
      status: 'not_found';
    }
  | {
      status: 'already_deleted';
    }
  | {
      status: 'deleted';
    };

export interface ProductMutationRepository {
  createProduct(input: CreateProductCommand): Promise<ProductEntity>;
  deleteProduct(id: string): Promise<DeleteProductResult>;
}
