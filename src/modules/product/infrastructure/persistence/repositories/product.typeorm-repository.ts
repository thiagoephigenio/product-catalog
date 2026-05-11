import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductAttributeOrmEntity } from '../entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from '../entities/product-category.orm-entity';
import { ProductMapper } from '../../mappers/product.mapper';

@Injectable()
export class ProductTypeOrmRepository implements IProductRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const [productOrm, attributes, productCategories] = await Promise.all([
      this.dataSource
        .getRepository(ProductOrmEntity)
        .findOne({ where: { id } }),
      this.dataSource
        .getRepository(ProductAttributeOrmEntity)
        .findBy({ productId: id }),
      this.dataSource
        .getRepository(ProductCategoryOrmEntity)
        .findBy({ productId: id }),
    ]);

    if (!productOrm) return null;

    return ProductMapper.toDomain(productOrm, attributes, productCategories);
  }

  async findByName(name: string): Promise<Product | null> {
    const productOrm = await this.dataSource
      .getRepository(ProductOrmEntity)
      .findOne({ where: { name } });

    if (!productOrm) return null;

    const [attributes, productCategories] = await Promise.all([
      this.dataSource
        .getRepository(ProductAttributeOrmEntity)
        .findBy({ productId: productOrm.id }),
      this.dataSource
        .getRepository(ProductCategoryOrmEntity)
        .findBy({ productId: productOrm.id }),
    ]);

    return ProductMapper.toDomain(productOrm, attributes, productCategories);
  }

  async save(product: Product): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      await em.save(ProductOrmEntity, ProductMapper.toOrm(product));

      await em.delete(ProductAttributeOrmEntity, { productId: product.id });
      if (product.attributes.length > 0) {
        const attrOrms = product.attributes.map((a) => {
          const attr = new ProductAttributeOrmEntity();
          attr.productId = product.id;
          attr.key = a.key;
          attr.value = a.value;
          return attr;
        });
        await em.save(ProductAttributeOrmEntity, attrOrms);
      }

      await em.delete(ProductCategoryOrmEntity, { productId: product.id });
      if (product.categoryIds.length > 0) {
        const catOrms = product.categoryIds.map((categoryId) => {
          const cat = new ProductCategoryOrmEntity();
          cat.productId = product.id;
          cat.categoryId = categoryId;
          return cat;
        });
        await em.save(ProductCategoryOrmEntity, catOrms);
      }
    });
  }

  async findAll(): Promise<Product[]> {
    const productOrms = await this.dataSource
      .getRepository(ProductOrmEntity)
      .find();
    if (productOrms.length === 0) return [];

    const ids = productOrms.map((p) => p.id);
    const [allAttributes, allProductCategories] = await Promise.all([
      this.dataSource
        .getRepository(ProductAttributeOrmEntity)
        .findBy({ productId: In(ids) }),
      this.dataSource
        .getRepository(ProductCategoryOrmEntity)
        .findBy({ productId: In(ids) }),
    ]);

    return productOrms.map((productOrm) =>
      ProductMapper.toDomain(
        productOrm,
        allAttributes.filter((a) => a.productId === productOrm.id),
        allProductCategories.filter((pc) => pc.productId === productOrm.id),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(ProductOrmEntity).delete(id);
  }
}
