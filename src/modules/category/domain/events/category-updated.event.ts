import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CategoryUpdatedEvent implements DomainEvent {
  readonly eventType = 'CategoryUpdated';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly name: string,
  ) {}
}
