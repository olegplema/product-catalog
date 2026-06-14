import { createHash } from 'node:crypto';

export type CreateProductCommandHashInput = {
  name: string;
  description: string | null;
  priceCents: number;
};

export function createProductRequestHash(input: CreateProductCommandHashInput): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        name: input.name,
        description: input.description ?? null,
        priceCents: input.priceCents,
      }),
    )
    .digest('hex');
}
