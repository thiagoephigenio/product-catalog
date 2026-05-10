import { DomainEvent } from '../../../../shared/domain/domain-event';

export interface ICategoryEventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

export const CATEGORY_EVENT_PUBLISHER = Symbol('ICategoryEventPublisher');
