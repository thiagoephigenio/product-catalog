import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ProductActivatedEvent implements DomainEvent {
  readonly eventType = 'ProductActivated';
  readonly occurredAt = new Date();

  constructor(readonly aggregateId: string) {}
}
