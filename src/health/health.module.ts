import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health-indicator';
import { RedisClientProvider } from './redis-client.provider';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisClientProvider, RedisHealthIndicator],
})
export class HealthModule {}
