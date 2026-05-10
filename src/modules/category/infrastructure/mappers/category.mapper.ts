import { Category } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from '../persistence/entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): Category {
    return Category.reconstitute({
      id: orm.id,
      name: orm.name,
      parentId: orm.parentId ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(category: Category): CategoryOrmEntity {
    const orm = new CategoryOrmEntity();
    orm.id = category.id;
    orm.name = category.name;
    orm.parentId = category.parentId ?? null;
    orm.createdAt = category.createdAt;
    orm.updatedAt = category.updatedAt;
    return orm;
  }
}
