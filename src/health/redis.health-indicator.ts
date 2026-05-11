import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AUDIT_QUEUE } from '../audit/audit-event-payload.interface';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @InjectQueue(AUDIT_QUEUE) private readonly queue: Queue,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const client = await this.queue.client;
      await client.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
