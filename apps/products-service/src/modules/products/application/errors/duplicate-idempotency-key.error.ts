export class DuplicateIdempotencyKeyError extends Error {
  constructor() {
    super('Duplicate idempotency key');
    this.name = DuplicateIdempotencyKeyError.name;
  }
}
