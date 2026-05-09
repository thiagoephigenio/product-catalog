import { Product } from './product.entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductCreatedEvent } from '../events/product-created.event';

describe('Product', () => {
  describe('create', () => {
    it('should create a product with DRAFT status', () => {
      const product = Product.create({ name: 'Monitor 4K' });

      expect(product.name).toBe('Monitor 4K');
      expect(product.status).toBe(ProductStatus.DRAFT);
      expect(product.id).toBeDefined();
    });

    it('should emit ProductCreatedEvent on creation', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      const events = product.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductCreatedEvent);
    });
  });
});
