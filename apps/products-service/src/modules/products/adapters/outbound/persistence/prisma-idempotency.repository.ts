import { Injectable } from '@nestjs/common';
import {
  IdempotencyOperation as PrismaIdempotencyOperation,
  IdempotencyStatus,
  Prisma,
} from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import { DuplicateIdempotencyKeyError } from '../../../application/errors/duplicate-idempotency-key.error';
import type {
  CreateCompletedIdempotencyRecordInput,
  IdempotencyOperation,
  IdempotencyRecord,
  IdempotencyRepository,
} from '../../../application/ports/idempotency.repository';
import type { ProductTransaction } from '../../../application/ports/product-transaction-manager';

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class PrismaIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deleteExpiredByOperationAndKey(
    operation: IdempotencyOperation,
    key: string,
    now: Date,
  ): Promise<void> {
    await this.prisma.idempotencyRecord.deleteMany({
      where: {
        operation: toPrismaOperation(operation),
        key,
        expiresAt: {
          lt: now,
        },
      },
    });
  }

  async findByOperationAndKey<TResponse>(
    operation: IdempotencyOperation,
    key: string,
  ): Promise<IdempotencyRecord<TResponse> | null> {
    const record = await this.prisma.idempotencyRecord.findUnique({
      where: {
        operation_key: {
          operation: toPrismaOperation(operation),
          key,
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      operation,
      key: record.key,
      requestHash: record.requestHash,
      status: 'COMPLETED',
      responseBody: record.responseBody as TResponse,
      resourceId: record.resourceId,
      expiresAt: record.expiresAt,
    };
  }

  async createCompleted<TResponse>(
    transaction: ProductTransaction,
    input: CreateCompletedIdempotencyRecordInput<TResponse>,
  ): Promise<void> {
    try {
      await this.getClient(transaction).idempotencyRecord.create({
        data: {
          operation: toPrismaOperation(input.operation),
          key: input.key,
          requestHash: input.requestHash,
          status: IdempotencyStatus.COMPLETED,
          responseBody: input.responseBody as Prisma.InputJsonValue,
          resourceId: input.resourceId,
          expiresAt: input.expiresAt,
        },
      });
    } catch (error) {
      if (isOperationKeyUniqueConstraintError(error)) {
        throw new DuplicateIdempotencyKeyError();
      }

      throw error;
    }
  }

  private getClient(transaction: ProductTransaction): TransactionClient {
    return transaction as TransactionClient;
  }
}

function toPrismaOperation(operation: IdempotencyOperation): PrismaIdempotencyOperation {
  return operation;
}

function isOperationKeyUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes('operation') &&
    error.meta.target.includes('key')
  );
}
