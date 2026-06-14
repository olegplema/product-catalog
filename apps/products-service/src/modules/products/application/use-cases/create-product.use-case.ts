import { Inject, Injectable } from '@nestjs/common';

import { DuplicateIdempotencyKeyError } from '../errors/duplicate-idempotency-key.error';
import { IdempotencyConflictError } from '../errors/idempotency-conflict.error';
import { InvalidIdempotencyKeyError } from '../errors/invalid-idempotency-key.error';
import {
  CREATE_PRODUCT_IDEMPOTENCY_OPERATION,
  IDEMPOTENCY_REPOSITORY,
  type IdempotencyRepository,
} from '../ports/idempotency.repository';
import { OUTBOX_REPOSITORY, type OutboxRepositoryPort } from '../ports/outbox.repository';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../ports/product.repository';
import {
  PRODUCT_TRANSACTION_MANAGER,
  type ProductTransaction,
  type ProductTransactionManager,
} from '../ports/product-transaction-manager';
import { createProductRequestHash } from '../services/create-product-request-hash';
import {
  createProductResponseFromProduct,
  type CreateProductResponse,
} from '../services/create-product-response';
import { toProductCreatedEvent } from '../services/product-event.factory';

export type CreateProductUseCaseInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  idempotencyKey?: string | null;
};

type CreateProductCommand = {
  name: string;
  description: string | null;
  priceCents: number;
};

export type CreateProductUseCaseResult = CreateProductResponse;

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: OutboxRepositoryPort,
    @Inject(IDEMPOTENCY_REPOSITORY)
    private readonly idempotencyRepository: IdempotencyRepository,
    @Inject(PRODUCT_TRANSACTION_MANAGER)
    private readonly productTransactionManager: ProductTransactionManager,
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<CreateProductUseCaseResult> {
    const command = toCreateProductCommand(input);
    const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);

    if (!idempotencyKey) {
      return this.create(command);
    }

    return this.createIdempotently(command, idempotencyKey);
  }

  private async create(command: CreateProductCommand): Promise<CreateProductUseCaseResult> {
    return this.productTransactionManager.runInTransaction(async (transaction) => {
      return this.createProductAndOutboxMessage(command, transaction);
    });
  }

  private async createIdempotently(
    command: CreateProductCommand,
    idempotencyKey: string,
  ): Promise<CreateProductUseCaseResult> {
    const requestHash = createProductRequestHash(command);
    const replayResult = await this.getReplayResultOrNull(idempotencyKey, requestHash);

    if (replayResult) {
      return replayResult;
    }

    try {
      return this.productTransactionManager.runInTransaction(async (transaction) => {
        const response = await this.createProductAndOutboxMessage(command, transaction);

        await this.idempotencyRepository.createCompleted(transaction, {
          operation: CREATE_PRODUCT_IDEMPOTENCY_OPERATION,
          key: idempotencyKey,
          requestHash,
          responseBody: response,
          resourceId: response.id,
          expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
        });

        return response;
      });
    } catch (error) {
      if (!(error instanceof DuplicateIdempotencyKeyError)) {
        throw error;
      }

      const replayAfterRace = await this.getReplayResultOrNull(idempotencyKey, requestHash);

      if (!replayAfterRace) {
        throw error;
      }

      return replayAfterRace;
    }
  }

  private async createProductAndOutboxMessage(
    command: CreateProductCommand,
    transaction: ProductTransaction,
  ): Promise<CreateProductUseCaseResult> {
    const product = await this.productRepository.create(command, transaction);

    await this.outboxRepository.insert(transaction, toProductCreatedEvent(product));

    return createProductResponseFromProduct(product);
  }

  private async getReplayResultOrNull(
    idempotencyKey: string,
    requestHash: string,
  ): Promise<CreateProductUseCaseResult | null> {
    await this.idempotencyRepository.deleteExpiredByOperationAndKey(
      CREATE_PRODUCT_IDEMPOTENCY_OPERATION,
      idempotencyKey,
      new Date(),
    );

    const existingRecord =
      await this.idempotencyRepository.findByOperationAndKey<CreateProductResponse>(
        CREATE_PRODUCT_IDEMPOTENCY_OPERATION,
        idempotencyKey,
      );

    if (!existingRecord) {
      return null;
    }

    if (existingRecord.requestHash !== requestHash) {
      throw new IdempotencyConflictError();
    }

    return existingRecord.responseBody;
  }
}

function toCreateProductCommand(input: CreateProductUseCaseInput): CreateProductCommand {
  return {
    name: input.name,
    description: input.description ?? null,
    priceCents: input.priceCents,
  };
}

function normalizeIdempotencyKey(value?: string | null): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw new InvalidIdempotencyKeyError();
  }

  return normalized;
}
