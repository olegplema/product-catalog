import { deleteRequest, getRequest, postRequest } from '../../../shared/api/http-client';
import type {
  CreateProductRequest,
  GetProductsParams,
  PaginatedProductsResponse,
  Product,
} from '../model/product.types';

export type CreateProductCommand = {
  payload: CreateProductRequest;
  idempotencyKey: string;
};

export async function getProducts(params: GetProductsParams): Promise<PaginatedProductsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return getRequest<PaginatedProductsResponse>(`/products?${searchParams.toString()}`);
}

export async function createProduct({
  payload,
  idempotencyKey,
}: CreateProductCommand): Promise<Product> {
  return postRequest<Product, CreateProductRequest>('/products', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteRequest(`/products/${encodeURIComponent(id)}`);
}
