import { Product } from './product.entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductActivatedEvent } from '../events/product-activated.event';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { MissingCategoryException } from '../exceptions/missing-category.exception';
import { MissingAttributeException } from '../exceptions/missing-attribute.exception';
import { ProductAlreadyActiveException } from '../exceptions/product-already-active.exception';
import { ProductAlreadyArchivedException } from '../exceptions/product-already-archived.exception';

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

  describe('activate', () => {
    it('should throw MissingCategoryException when no categories', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.addAttribute('color', 'black');

      expect(() => product.activate()).toThrow(MissingCategoryException);
    });

    it('should throw MissingAttributeException when no attributes', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.addCategory('cat-1');

      expect(() => product.activate()).toThrow(MissingAttributeException);
    });

    it('should activate and emit ProductActivatedEvent', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.addCategory('cat-1');
      product.addAttribute('color', 'black');
      product.pullDomainEvents();

      product.activate();

      expect(product.status).toBe(ProductStatus.ACTIVE);
      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof ProductActivatedEvent)).toBe(true);
    });

    it('should throw ProductAlreadyActiveException when already active', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.addCategory('cat-1');
      product.addAttribute('color', 'black');
      product.activate();

      expect(() => product.activate()).toThrow(ProductAlreadyActiveException);
    });
  });

  describe('archive', () => {
    it('should archive and emit ProductArchivedEvent', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.pullDomainEvents();

      product.archive();

      expect(product.status).toBe(ProductStatus.ARCHIVED);
      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof ProductArchivedEvent)).toBe(true);
    });

    it('should throw ProductAlreadyArchivedException when already archived', () => {
      const product = Product.create({ name: 'Monitor 4K' });
      product.archive();

      expect(() => product.archive()).toThrow(ProductAlreadyArchivedException);
    });
  });
});
