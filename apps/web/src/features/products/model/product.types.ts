export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductsPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProductsResponse = {
  items: Product[];
  meta: ProductsPaginationMeta;
};

export type GetProductsParams = {
  page: number;
  limit: number;
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  price: string;
};
