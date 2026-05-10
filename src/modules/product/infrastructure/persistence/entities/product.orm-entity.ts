import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true, default: null })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
