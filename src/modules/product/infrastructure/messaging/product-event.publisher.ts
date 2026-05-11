import { Injectable } from '@nestjs/common';
import { IProductEventPublisher } from '../../application/ports/product-event-publisher.interface';
import { DomainEvent } from '../../../../shared/domain/domain-event';

@Injectable()
export class ProductEventPublisher implements IProductEventPublisher {
  async publish(_events: DomainEvent[]): Promise<void> {}
}
