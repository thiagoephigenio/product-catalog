import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { AUDIT_QUEUE } from '../audit-event-payload.interface';
import type { AuditEventPayload } from '../audit-event-payload.interface';
import { AuditLogRepository } from '../persistence/repositories/audit-log.repository';

@Processor(AUDIT_QUEUE)
export class AuditEventProcessor extends WorkerHost {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    @InjectPinoLogger(AuditEventProcessor.name)
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async process(job: Job<AuditEventPayload>): Promise<void> {
    try {
      await this.auditLogRepository.save(job.data);
    } catch (error) {
      this.logger.error(
        {
          action: 'audit.persist',
          jobId: job.id,
          eventType: job.data.eventType,
          aggregateId: job.data.aggregateId,
          correlationId: job.data.correlationId,
          payload: job.data,
          error: error instanceof Error ? error.stack : String(error),
        },
        'Failed to persist audit log',
      );
      throw error;
    }
  }
}
