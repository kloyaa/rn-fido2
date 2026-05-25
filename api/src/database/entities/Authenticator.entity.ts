import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';

export type AuthenticatorStatus = 'active' | 'revoked';

@Entity('authenticators')
export class Authenticator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.authenticators, { lazy: true })
  @JoinColumn({ name: 'userId' })
  user!: Promise<User>;

  @Column({ type: 'bytea', unique: true })
  credentialId!: Buffer;

  @Column({ type: 'bytea' })
  publicKey!: Buffer;

  @Column({ type: 'jsonb', nullable: true })
  attestationData!: object | null;

  @CreateDateColumn()
  enrolledAt!: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  lastUsedAt!: Date | null;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  deviceName!: string | null;

  @Column({ type: 'bigint', default: 0 })
  signCounter!: number;

  @Column({ type: 'varchar', default: 'active', length: 10 })
  status!: AuthenticatorStatus;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt!: Date | null;
}
