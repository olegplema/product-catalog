export class SqsPublisherConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqsPublisherConfigurationError';
  }
}

export class SqsQueueResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqsQueueResolutionError';
  }
}
