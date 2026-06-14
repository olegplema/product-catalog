import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';

import { OutboxRepository } from '../persistence/prisma-outbox.repository';
import {
  PRODUCT_EVENT_PUBLISHER,
  type ProductEventPublisher,
} from '../../../application/ports/product-event-publisher';

const OUTBOX_NOTIFY_CHANNEL = 'product_outbox_notify';
const OUTBOX_BATCH_SIZE = 10;
const OUTBOX_FALLBACK_SCAN_INTERVAL_MS = 30_000;

@Injectable()
export class ProductOutboxPublisherWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductOutboxPublisherWorker.name);
  private readonly listenerClient: Client;
  private fallbackScanTimer?: NodeJS.Timeout;
  private isDraining = false;
  private drainRequested = false;
  private isShuttingDown = false;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly productEventPublisher: ProductEventPublisher,
  ) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.listenerClient = new Client({
      connectionString,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.listenerClient.connect();
    this.listenerClient.on('notification', this.handleNotification);
    this.listenerClient.on('error', this.handleListenerError);
    await this.listenerClient.query(`LISTEN ${OUTBOX_NOTIFY_CHANNEL}`);

    this.fallbackScanTimer = setInterval(() => {
      void this.scheduleDrain();
    }, OUTBOX_FALLBACK_SCAN_INTERVAL_MS);

    await this.scheduleDrain();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;

    if (this.fallbackScanTimer) {
      clearInterval(this.fallbackScanTimer);
    }

    this.listenerClient.off('notification', this.handleNotification);
    this.listenerClient.off('error', this.handleListenerError);
    await this.listenerClient.end();
  }

  private readonly handleNotification = (): void => {
    void this.scheduleDrain();
  };

  private readonly handleListenerError = (error: Error): void => {
    this.logger.error(error.message);
  };

  private async scheduleDrain(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    if (this.isDraining) {
      this.drainRequested = true;
      return;
    }

    this.isDraining = true;

    try {
      do {
        this.drainRequested = false;
        await this.drainOutbox();
      } while (this.drainRequested && !this.isShuttingDown);
    } finally {
      this.isDraining = false;
    }
  }

  private async drainOutbox(): Promise<void> {
    while (!this.isShuttingDown) {
      try {
        const processedCount = await this.outboxRepository.processNextBatch(
          OUTBOX_BATCH_SIZE,
          async (event) => this.productEventPublisher.publish(event),
        );

        if (processedCount === 0) {
          return;
        }
      } catch (error) {
        this.logger.error(toErrorMessage(error));
        return;
      }
    }
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown outbox worker error';
}
