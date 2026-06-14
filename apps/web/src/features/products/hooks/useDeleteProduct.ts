import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProduct } from '../api/products-api';
import { productQueryKeys } from '../api/product-query-keys';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
