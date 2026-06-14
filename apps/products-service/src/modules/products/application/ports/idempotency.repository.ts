import type { ProductTransaction } from './product-transaction-manager';

export const IDEMPOTENCY_REPOSITORY = Symbol('IDEMPOTENCY_REPOSITORY');

export const CREATE_PRODUCT_IDEMPOTENCY_OPERATION = 'CREATE_PRODUCT';

export type IdempotencyOperation = typeof CREATE_PRODUCT_IDEMPOTENCY_OPERATION;

export type IdempotencyStatus = 'COMPLETED';

export type IdempotencyRecord<TResponse> = {
  operation: IdempotencyOperation;
  key: string;
  requestHash: string;
  status: IdempotencyStatus;
  responseBody: TResponse;
  resourceId: string | null;
  expiresAt: Date;
};

export type CreateCompletedIdempotencyRecordInput<TResponse> = {
  operation: IdempotencyOperation;
  key: string;
  requestHash: string;
  responseBody: TResponse;
  resourceId: string | null;
  expiresAt: Date;
};

export interface IdempotencyRepository {
  deleteExpiredByOperationAndKey(
    operation: IdempotencyOperation,
    key: string,
    now: Date,
  ): Promise<void>;
  findByOperationAndKey<TResponse>(
    operation: IdempotencyOperation,
    key: string,
  ): Promise<IdempotencyRecord<TResponse> | null>;
  createCompleted<TResponse>(
    transaction: ProductTransaction,
    input: CreateCompletedIdempotencyRecordInput<TResponse>,
  ): Promise<void>;
}
