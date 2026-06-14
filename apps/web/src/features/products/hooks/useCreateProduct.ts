import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from '../api/products-api';
import { productQueryKeys } from '../api/product-query-keys';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
