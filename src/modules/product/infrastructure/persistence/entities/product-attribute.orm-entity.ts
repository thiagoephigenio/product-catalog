import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_attributes')
export class ProductAttributeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar' })
  key!: string;

  @Column({ type: 'varchar' })
  value!: string;
}
