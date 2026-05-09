import { Category } from './category.entity';
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
  });

  describe('update', () => {
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
