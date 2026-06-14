import { Injectable } from '@nestjs/common';
import type { ProductEvent } from '@product-catalog/contracts';

import { Prisma } from '../../../../../generated/prisma/client';
import { OutboxStatus } from '../../../../../generated/prisma/enums';
import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';

const MAX_PUBLISH_ATTEMPTS = 5;

type TransactionClient = Prisma.TransactionClient;

type OutboxMessageRow = {
  id: string;
  payload: ProductEvent;
  attempts: number;
};

@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insert(tx: TransactionClient, event: ProductEvent): Promise<void> {
    await tx.outboxMessage.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event,
      },
    });
  }

  async processNextBatch(
    batchSize: number,
    publish: (event: ProductEvent) => Promise<void>,
  ): Promise<number> {
    return this.prisma.$transaction(
      async (tx) => {
        const messages = await tx.$queryRaw<OutboxMessageRow[]>(Prisma.sql`
          SELECT id, payload, attempts
          FROM "outbox_messages"
          WHERE status = 'PENDING'::"OutboxStatus"
          ORDER BY created_at ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `);

        for (const message of messages) {
          try {
            await publish(message.payload);

            await tx.outboxMessage.update({
              where: {
                id: message.id,
              },
              data: {
                status: OutboxStatus.PUBLISHED,
                publishedAt: new Date(),
                lastError: null,
              },
            });
          } catch (error) {
            const attempts = message.attempts + 1;

            await tx.outboxMessage.update({
              where: {
                id: message.id,
              },
              data: {
                attempts,
                status:
                  attempts >= MAX_PUBLISH_ATTEMPTS ? OutboxStatus.FAILED : OutboxStatus.PENDING,
                lastError: toErrorMessage(error),
              },
            });
          }
        }

        return messages.length;
      },
      {
        timeout: 60_000,
      },
    );
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown outbox publish error';
}
