import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CategoryCreatedEvent implements DomainEvent {
  readonly eventType = 'CategoryCreated';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly name: string,
  ) {}
}
