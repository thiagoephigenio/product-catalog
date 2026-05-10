import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ProductCreatedEvent implements DomainEvent {
  readonly eventType = 'ProductCreated';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly name: string,
  ) {}
}
