import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { toCreateProductInput, toPaginatedProductsResponse } from './product-http.mapper';
import type { PaginatedProductsResponseDto, ProductResponseDto } from './dto/product-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<ProductResponseDto> {
    return this.createProductUseCase.execute({
      ...toCreateProductInput(dto),
      ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
    });
  }

  @Get()
  async list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsResponseDto> {
    const result = await this.listProductsUseCase.execute({
      ...(query.page === undefined ? {} : { page: query.page }),
      ...(query.limit === undefined ? {} : { limit: query.limit }),
    });

    return toPaginatedProductsResponse(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteProductUseCase.execute({ id });
  }
}
