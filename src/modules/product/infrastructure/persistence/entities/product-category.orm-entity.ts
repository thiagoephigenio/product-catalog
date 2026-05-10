import { Entity, PrimaryColumn } from 'typeorm';

@Entity('product_categories')
export class ProductCategoryOrmEntity {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @PrimaryColumn({ name: 'category_id', type: 'uuid' })
  categoryId!: string;
}
