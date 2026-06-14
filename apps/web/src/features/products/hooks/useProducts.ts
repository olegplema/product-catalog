import { useQuery } from '@tanstack/react-query';

import { getProducts } from '../api/products-api';
import { productQueryKeys } from '../api/product-query-keys';
import type { GetProductsParams } from '../model/product.types';

export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProducts(params),
  });
}
