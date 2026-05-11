import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AUDIT_QUEUE } from '../audit-event-payload.interface';
import type { AuditEventPayload } from '../audit-event-payload.interface';
import { AuditLogRepository } from '../persistence/repositories/audit-log.repository';

@Processor(AUDIT_QUEUE)
export class AuditEventProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditEventProcessor.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {
    super();
  }

  async process(job: Job<AuditEventPayload>): Promise<void> {
    try {
      await this.auditLogRepository.save(job.data);
    } catch (error) {
      this.logger.error('Failed to persist audit log', {
        jobId: job.id,
        eventType: job.data.eventType,
        aggregateId: job.data.aggregateId,
        error: error instanceof Error ? error.stack : String(error),
        payload: job.data,
      });
      throw error;
    }
  }
}
