export type ProductResponseDto = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProductsResponseDto = {
  items: ProductResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
