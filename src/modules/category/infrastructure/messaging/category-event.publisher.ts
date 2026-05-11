import { Injectable } from '@nestjs/common';
import type { ICategoryEventPublisher } from '../../application/ports/category-event-publisher.interface';
import { DomainEvent } from '../../../../shared/domain/domain-event';

@Injectable()
export class CategoryEventPublisher implements ICategoryEventPublisher {
  async publish(_events: DomainEvent[]): Promise<void> {}
}
