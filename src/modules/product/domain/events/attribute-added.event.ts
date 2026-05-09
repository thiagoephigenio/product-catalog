import { DomainEvent } from '../../../../shared/domain/domain-event';

export class AttributeAddedEvent implements DomainEvent {
  readonly eventType = 'AttributeAdded';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly key: string,
    readonly value: string,
  ) {}
}
