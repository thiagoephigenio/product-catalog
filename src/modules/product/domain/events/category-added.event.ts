import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CategoryAddedEvent implements DomainEvent {
  readonly eventType = 'CategoryAdded';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly categoryId: string,
  ) {}
}
