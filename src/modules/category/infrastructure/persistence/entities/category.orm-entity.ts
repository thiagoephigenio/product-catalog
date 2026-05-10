import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true, default: null })
  parentId!: string | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
