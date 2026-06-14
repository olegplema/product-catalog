export class SqsConsumerConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqsConsumerConfigurationError';
  }
}

export class SqsQueueResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqsQueueResolutionError';
  }
}
