import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditLogOrmEntity } from '../entities/audit-log.orm-entity';
import type { AuditEventPayload } from '../../audit-event-payload.interface';

@Injectable()
export class AuditLogRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(payload: AuditEventPayload): Promise<void> {
    const repo = this.dataSource.getRepository(AuditLogOrmEntity);
    const log = repo.create({
      eventType: payload.eventType,
      aggregateId: payload.aggregateId,
      aggregateType: payload.aggregateType,
      payload: payload.payload,
      correlationId: payload.correlationId ?? null,
      occurredAt: new Date(payload.occurredAt),
    });
    await repo.save(log);
  }
}
