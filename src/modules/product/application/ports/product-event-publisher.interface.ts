import { DomainEvent } from '../../../../shared/domain/domain-event';

export interface IProductEventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

export const PRODUCT_EVENT_PUBLISHER = Symbol('IProductEventPublisher');
