import { ArgumentsHost, Catch, type ExceptionFilter, HttpStatus, type Type } from '@nestjs/common';

import { ProductNotFoundError } from '../../../../application/errors/product-not-found.error';
import { InvalidPriceError } from '../errors/invalid-price.error';

type HttpRequest = {
  url: string;
};

type HttpResponse = {
  status(statusCode: number): {
    json(body: ErrorResponseDto): void;
  };
};

type ErrorHttpMapping = {
  statusCode: HttpStatus;
  error: string;
};

type ErrorResponseDto = {
  statusCode: HttpStatus;
  message: string;
  error: string;
  path: string;
  timestamp: string;
};

const ERROR_HTTP_MAPPINGS = new Map<Type<Error>, ErrorHttpMapping>()
  .set(ProductNotFoundError, {
    statusCode: HttpStatus.NOT_FOUND,
    error: 'Not Found',
  })
  .set(InvalidPriceError, {
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
  });

const KNOWN_PRODUCT_HTTP_ERRORS = [...ERROR_HTTP_MAPPINGS.keys()];

@Catch(...KNOWN_PRODUCT_HTTP_ERRORS)
export class ProductHttpErrorFilter implements ExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<HttpResponse>();
    const request = http.getRequest<HttpRequest>();

    const mapping = getHttpMapping(exception);

    response.status(mapping.statusCode).json({
      statusCode: mapping.statusCode,
      message: exception.message,
      error: mapping.error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

function getHttpMapping(exception: Error): ErrorHttpMapping {
  for (const [ErrorClass, mapping] of ERROR_HTTP_MAPPINGS) {
    if (exception instanceof ErrorClass) {
      return mapping;
    }
  }

  throw exception;
}
