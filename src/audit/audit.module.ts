import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AUDIT_QUEUE } from './audit-event-payload.interface';
import { AuditEventProcessor } from './consumers/audit-event.processor';
import { AuditLogRepository } from './persistence/repositories/audit-log.repository';

@Module({
  imports: [BullModule.registerQueue({ name: AUDIT_QUEUE })],
  providers: [AuditEventProcessor, AuditLogRepository],
})
export class AuditModule {}
