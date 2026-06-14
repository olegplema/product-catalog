export class InvalidIdempotencyKeyError extends Error {
  constructor() {
    super('Idempotency-Key must be at most 255 characters long');
    this.name = InvalidIdempotencyKeyError.name;
  }
}
