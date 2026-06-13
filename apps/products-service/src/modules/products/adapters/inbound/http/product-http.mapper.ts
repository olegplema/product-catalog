import type { CreateProductUseCaseInput } from '../../../application/use-cases/create-product.use-case';
import type { ListProductsUseCaseResult } from '../../../application/use-cases/list-products.use-case';
import type { ProductEntity } from '../../../domain/product.entity';
import type { PaginatedProductsResponseDto, ProductResponseDto } from './dto/product-response.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import { formatPriceFromCents, parsePriceToCents } from './price.mapper';

export function toCreateProductInput(dto: CreateProductDto): CreateProductUseCaseInput {
  return {
    name: dto.name,
    description: dto.description ?? null,
    priceCents: parsePriceToCents(dto.price),
  };
}

export function toProductResponse(product: ProductEntity): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: formatPriceFromCents(product.priceCents),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toPaginatedProductsResponse(
  result: ListProductsUseCaseResult,
): PaginatedProductsResponseDto {
  return {
    items: result.items.map(toProductResponse),
    meta: result.meta,
  };
}
