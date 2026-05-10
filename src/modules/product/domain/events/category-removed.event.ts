import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CategoryRemovedEvent implements DomainEvent {
  readonly eventType = 'CategoryRemoved';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly categoryId: string,
  ) {}
}
