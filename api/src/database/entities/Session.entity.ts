import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz' })
  inactivityExpiresAt!: Date;

  @Column({ type: 'timestamptz' })
  lastActivityAt!: Date;

  @Column({ type: 'varchar', length: 45 })
  ipAddress!: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  deviceIdentifier!: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt!: Date | null;
}
