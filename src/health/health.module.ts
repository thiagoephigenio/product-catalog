import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bullmq';
import { AUDIT_QUEUE } from '../audit/audit-event-payload.interface';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health-indicator';

@Module({
  imports: [TerminusModule, BullModule.registerQueue({ name: AUDIT_QUEUE })],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
