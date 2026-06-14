import { Alert, Card, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { useCreateProduct } from '../hooks/useCreateProduct';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useProducts } from '../hooks/useProducts';
import { useProductsPageLimit } from '../hooks/useProductsPageLimit';
import type { CreateProductRequest, Product } from '../model/product.types';
import { CreateProductDialog } from './CreateProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';
import { ProductsGrid } from './ProductsGrid';
import { ProductsToolbar } from './ProductsToolbar';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const limit = useProductsPageLimit();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const productsQuery = useProducts({ page, limit });
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const createErrorMessage = useMemo(() => {
    const error = createProductMutation.error;
    return error instanceof Error ? error.message : undefined;
  }, [createProductMutation.error]);

  const listErrorMessage = useMemo(() => {
    const error = productsQuery.error;
    return error instanceof Error ? error.message : 'Failed to load products';
  }, [productsQuery.error]);

  return (
    <main className="app-shell">
      <div className="page-container">
        <ProductsToolbar onCreateClick={() => setIsCreateOpen(true)} />

        <Card className="products-card" variant="borderless">
          {productsQuery.isError ? (
            <Alert
              type="error"
              title="Could not load products"
              description={listErrorMessage}
              showIcon
            />
          ) : productsQuery.isLoading ? (
            <div className="products-loader">
              <Spin size="large" />
            </div>
          ) : (
            <ProductsGrid
              data={productsQuery.data}
              loading={productsQuery.isFetching}
              onDelete={setProductToDelete}
              onPaginationChange={setPage}
            />
          )}
        </Card>

        <CreateProductDialog
          open={isCreateOpen}
          confirmLoading={createProductMutation.isPending}
          errorMessage={createErrorMessage}
          onCancel={() => {
            if (!createProductMutation.isPending) {
              createProductMutation.reset();
              setIsCreateOpen(false);
            }
          }}
          onSubmit={async (values: CreateProductRequest) => {
            await createProductMutation.mutateAsync(values);
            createProductMutation.reset();
            setIsCreateOpen(false);
          }}
        />

        <DeleteProductDialog
          product={productToDelete}
          confirmLoading={deleteProductMutation.isPending}
          onCancel={() => {
            if (!deleteProductMutation.isPending) {
              deleteProductMutation.reset();
              setProductToDelete(null);
            }
          }}
          onConfirm={async (product) => {
            await deleteProductMutation.mutateAsync(product.id);
            deleteProductMutation.reset();
            setProductToDelete(null);
          }}
        />
      </div>
    </main>
  );
}
