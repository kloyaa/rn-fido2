import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'uuid' })
  userId!: string | null;

  @Column({ type: 'varchar', length: 50 })
  eventType!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'varchar', length: 45 })
  ipAddress!: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo!: object | null;

  @Column({ type: 'varchar', length: 20 })
  result!: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  errorMessage!: string | null;

  @Column({ nullable: true, type: 'uuid' })
  sessionId!: string | null;
}
