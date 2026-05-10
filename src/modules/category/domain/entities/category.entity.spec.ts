import { Category } from './category.entity';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { CategoryUpdatedEvent } from '../events/category-updated.event';
import { SelfParentException } from '../exceptions/self-parent.exception';

describe('Category', () => {
  describe('create', () => {
    it('should create a category with name and no parent', () => {
      const category = Category.create({ name: 'Eletrônicos' });

      expect(category.name).toBe('Eletrônicos');
      expect(category.parentId).toBeUndefined();
      expect(category.id).toBeDefined();
    });

    it('should create a category with a parent', () => {
      const category = Category.create({
        name: 'Notebooks',
        parentId: 'parent-id',
      });

      expect(category.parentId).toBe('parent-id');
    });

    it('should emit CategoryCreatedEvent on creation', () => {
      const category = Category.create({ name: 'Eletrônicos' });
      const events = category.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CategoryCreatedEvent);
    });
  });

  describe('update', () => {
    it('should update name and emit CategoryUpdatedEvent', () => {
      const category = Category.create({ name: 'Eletrônicos' });
      category.pullDomainEvents();

      category.update({ name: 'Eletrônicos e Informática' });

      expect(category.name).toBe('Eletrônicos e Informática');
      const events = category.pullDomainEvents();
      expect(events.some((e) => e instanceof CategoryUpdatedEvent)).toBe(true);
    });

    it('should update parentId', () => {
      const category = Category.create({ name: 'Notebooks' });
      category.update({ name: 'Notebooks', parentId: 'new-parent-id' });

      expect(category.parentId).toBe('new-parent-id');
    });

    it('should remove parentId when not provided', () => {
      const category = Category.create({
        name: 'Notebooks',
        parentId: 'parent-id',
      });
      category.update({ name: 'Notebooks' });

      expect(category.parentId).toBeUndefined();
    });

    it('should throw SelfParentException when parentId equals own id', () => {
      const category = Category.create({ name: 'Eletrônicos' });

      expect(() =>
        category.update({ name: 'Eletrônicos', parentId: category.id }),
      ).toThrow(SelfParentException);
    });
  });
});
