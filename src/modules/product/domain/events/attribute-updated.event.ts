import { DomainEvent } from '../../../../shared/domain/domain-event';

export class AttributeUpdatedEvent implements DomainEvent {
  readonly eventType = 'AttributeUpdated';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly key: string,
    readonly value: string,
  ) {}
}
