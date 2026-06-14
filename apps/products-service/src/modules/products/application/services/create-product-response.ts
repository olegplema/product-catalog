import type { ProductEntity } from '../../domain/product.entity';

export type CreateProductResponse = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
};

export function createProductResponseFromProduct(product: ProductEntity): CreateProductResponse {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: formatPriceFromCents(product.priceCents),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function formatPriceFromCents(priceCents: number): string {
  const dollars = Math.floor(priceCents / 100);
  const cents = String(priceCents % 100).padStart(2, '0');

  return `${String(dollars)}.${cents}`;
}
