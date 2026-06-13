export type ProductEntity = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
