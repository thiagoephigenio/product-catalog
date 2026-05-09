import { Category } from './category.entity';

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
});
