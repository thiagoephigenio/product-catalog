import { Product } from '../../domain/entities/product.entity';
import { ProductAttribute } from '../../domain/entities/product-attribute.vo';
import { ProductOrmEntity } from '../persistence/entities/product.orm-entity';
import { ProductAttributeOrmEntity } from '../persistence/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from '../persistence/entities/product-category.orm-entity';

export class ProductMapper {
  static toDomain(
    orm: ProductOrmEntity,
    attributes: ProductAttributeOrmEntity[],
    productCategories: ProductCategoryOrmEntity[],
  ): Product {
    return Product.reconstitute({
      id: orm.id,
      name: orm.name,
      description: orm.description ?? undefined,
      status: orm.status,
      attributes: attributes.map((a) => new ProductAttribute(a.key, a.value)),
      categoryIds: productCategories.map((pc) => pc.categoryId),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(product: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = product.id;
    orm.name = product.name;
    orm.description = product.description ?? null;
    orm.status = product.status;
    orm.createdAt = product.createdAt;
    orm.updatedAt = product.updatedAt;
    return orm;
  }
}
