import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType!: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string;

  @Column({ name: 'aggregate_type', type: 'varchar' })
  aggregateType!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({
    name: 'correlation_id',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  correlationId!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamp' })
  occurredAt!: Date;
}
