import { Button, Card, Empty, Pagination, Spin } from 'antd';

import type { PaginatedProductsResponse, Product } from '../model/product.types';

type ProductsGridProps = {
  data: PaginatedProductsResponse | undefined;
  loading: boolean;
  onDelete: (product: Product) => void;
  onPaginationChange: (page: number) => void;
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function ProductsGrid({ data, loading, onDelete, onPaginationChange }: ProductsGridProps) {
  const products = data?.items ?? [];

  if (products.length === 0) {
    return (
      <div className="products-empty">
        <Empty description="No products yet" />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="products-grid-wrapper">
        <div className="products-grid">
          {products.map((product) => (
            <Card key={product.id} className="product-card" variant="borderless">
              <article className="product-card-body">
                <div className="product-card-header">
                  <h2 className="product-card-title">{product.name}</h2>
                  <span className="product-card-price">${product.price}</span>
                </div>

                <p className="product-card-description">{product.description?.trim() || '—'}</p>

                <div className="product-card-meta">
                  Created: {dateTimeFormatter.format(new Date(product.createdAt))}
                </div>

                <div className="product-card-actions">
                  <Button className="button-plain" onClick={() => onDelete(product)}>
                    Delete
                  </Button>
                </div>
              </article>
            </Card>
          ))}
        </div>

        <div className="products-pagination">
          <Pagination
            current={data?.meta.page ?? 1}
            pageSize={data?.meta.limit ?? 12}
            total={data?.meta.total ?? 0}
            showSizeChanger={false}
            onChange={onPaginationChange}
          />
        </div>
      </div>
    </Spin>
  );
}
