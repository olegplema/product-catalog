export const PRODUCT_TRANSACTION_MANAGER = Symbol('PRODUCT_TRANSACTION_MANAGER');

export type ProductTransaction = object;

export interface ProductTransactionManager {
  runInTransaction<T>(callback: (transaction: ProductTransaction) => Promise<T>): Promise<T>;
}
