import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ProductArchivedEvent implements DomainEvent {
  readonly eventType = 'ProductArchived';
  readonly occurredAt = new Date();

  constructor(readonly aggregateId: string) {}
}
