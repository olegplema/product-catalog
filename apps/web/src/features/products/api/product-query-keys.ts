import type { GetProductsParams } from '../model/product.types';

export const productQueryKeys = {
  all: ['products'] as const,
  list: (params: GetProductsParams) => [...productQueryKeys.all, 'list', params] as const,
};
