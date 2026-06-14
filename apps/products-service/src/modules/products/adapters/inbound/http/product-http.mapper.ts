import type { CreateProductUseCaseInput } from '../../../application/use-cases/create-product.use-case';
import type { ListProductsUseCaseResult } from '../../../application/use-cases/list-products.use-case';
import { createProductResponseFromProduct } from '../../../application/services/create-product-response';
import type { PaginatedProductsResponseDto } from './dto/product-response.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import { parsePriceToCents } from './price.mapper';

export function toCreateProductInput(dto: CreateProductDto): CreateProductUseCaseInput {
  return {
    name: dto.name,
    description: dto.description ?? null,
    priceCents: parsePriceToCents(dto.price),
  };
}

export function toPaginatedProductsResponse(
  result: ListProductsUseCaseResult,
): PaginatedProductsResponseDto {
  return {
    items: result.items.map(createProductResponseFromProduct),
    meta: result.meta,
  };
}
