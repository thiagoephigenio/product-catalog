import { DomainEvent } from '../../../../shared/domain/domain-event';

export class AttributeRemovedEvent implements DomainEvent {
  readonly eventType = 'AttributeRemoved';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly key: string,
  ) {}
}
