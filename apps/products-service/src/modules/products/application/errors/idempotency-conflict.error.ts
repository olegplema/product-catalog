export class IdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency-Key has already been used with a different request payload');
    this.name = IdempotencyConflictError.name;
  }
}
