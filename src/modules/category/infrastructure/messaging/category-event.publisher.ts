import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { ICategoryEventPublisher } from '../../application/ports/category-event-publisher.interface';
import type { DomainEvent } from '../../../../shared/domain/domain-event';
import { AUDIT_QUEUE } from '../../../../audit/audit-event-payload.interface';
import type { AuditEventPayload } from '../../../../audit/audit-event-payload.interface';

@Injectable()
export class CategoryEventPublisher implements ICategoryEventPublisher {
  constructor(@InjectQueue(AUDIT_QUEUE) private readonly queue: Queue) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const { eventType, aggregateId, occurredAt, ...specificData } =
        JSON.parse(JSON.stringify(event)) as {
          eventType: string;
          aggregateId: string;
          occurredAt: string;
          [key: string]: unknown;
        };

      const auditPayload: AuditEventPayload = {
        eventType,
        aggregateId,
        aggregateType: 'Category',
        occurredAt,
        payload: specificData,
      };

      await this.queue.add(eventType, auditPayload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
    }
  }
}
