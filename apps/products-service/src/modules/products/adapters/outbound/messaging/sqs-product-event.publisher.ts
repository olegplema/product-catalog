import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { GetQueueUrlCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

import {
  SqsPublisherConfigurationError,
  SqsQueueResolutionError,
} from './errors/sqs-publisher.error';
import type {
  ProductEventMessage,
  ProductEventPublisher,
} from '../../../application/ports/product-event-publisher';

@Injectable()
export class SqsProductEventPublisher implements ProductEventPublisher, OnModuleDestroy {
  private readonly client: SQSClient;
  private readonly queueName: string;
  private queueUrl?: string;

  constructor() {
    const region = getRequiredEnv('AWS_REGION');
    const endpoint = getRequiredEnv('SQS_ENDPOINT');
    const accessKeyId = getRequiredEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = getRequiredEnv('AWS_SECRET_ACCESS_KEY');

    this.queueName = getRequiredEnv('PRODUCT_EVENTS_QUEUE_NAME');

    this.client = new SQSClient({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async publish(message: ProductEventMessage): Promise<void> {
    const queueUrl = await this.getQueueUrl();

    await this.client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }

  private async getQueueUrl(): Promise<string> {
    if (this.queueUrl) {
      return this.queueUrl;
    }

    const result = await this.client.send(
      new GetQueueUrlCommand({
        QueueName: this.queueName,
      }),
    );

    if (!result.QueueUrl) {
      throw new SqsQueueResolutionError(
        `SQS queue URL was not returned for queue "${this.queueName}"`,
      );
    }

    this.queueUrl = result.QueueUrl;

    return this.queueUrl;
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new SqsPublisherConfigurationError(`${name} is not defined`);
  }

  return value;
}
