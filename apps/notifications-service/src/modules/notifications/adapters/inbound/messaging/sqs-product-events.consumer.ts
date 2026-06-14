import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import {
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

import { HandleProductEventUseCase } from '../../../application/use-cases/handle-product-event.use-case';
import {
  SqsConsumerConfigurationError,
  SqsQueueResolutionError,
} from './errors/sqs-consumer.error';
import { parseProductEvent } from './product-event.parser';
import type { ProductEvent } from '@product-catalog/contracts';

@Injectable()
export class SqsProductEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsProductEventsConsumer.name);
  private readonly client: SQSClient;
  private readonly queueName: string;
  private queueUrl?: string;
  private isRunning = false;

  constructor(private readonly handleProductEventUseCase: HandleProductEventUseCase) {
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

  onModuleInit(): void {
    this.isRunning = true;
    void this.pollLoop();
  }

  onModuleDestroy(): void {
    this.isRunning = false;
    this.client.destroy();
  }

  private async pollLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const queueUrl = await this.getQueueUrl();
        const result = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            WaitTimeSeconds: 10,
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 30,
          }),
        );

        for (const message of result.Messages ?? []) {
          await this.processMessage(queueUrl, message.Body, message.ReceiptHandle);
        }
      } catch (error: unknown) {
        this.logger.error('SQS polling failed', error instanceof Error ? error.stack : undefined);
        await sleep(2000);
      }
    }
  }

  private async processMessage(
    queueUrl: string,
    body: string | undefined,
    receiptHandle: string | undefined,
  ): Promise<void> {
    if (!receiptHandle) {
      this.logger.warn('Received SQS message without receipt handle');
      return;
    }

    const event = this.parseMessageBody(body);

    if (!event) {
      await this.deleteMessage(queueUrl, receiptHandle);
      return;
    }

    this.handleProductEventUseCase.execute(event);
    await this.deleteMessage(queueUrl, receiptHandle);
  }

  private parseMessageBody(body: string | undefined): ProductEvent | null {
    if (!body) {
      this.logger.warn('Received SQS message without body');
      return null;
    }

    try {
      const parsedBody = JSON.parse(body) as unknown;
      const event = parseProductEvent(parsedBody);

      if (!event) {
        this.logger.warn('Received malformed product event message');
        return null;
      }

      return event;
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        this.logger.warn('Received malformed JSON in SQS message');
        return null;
      }

      throw error;
    }
  }

  private async deleteMessage(queueUrl: string, receiptHandle: string | undefined): Promise<void> {
    if (!receiptHandle) {
      return;
    }

    try {
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: receiptHandle,
        }),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Failed to delete SQS message',
        error instanceof Error ? error.stack : undefined,
      );
    }
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
    throw new SqsConsumerConfigurationError(`${name} is not defined`);
  }

  return value;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
