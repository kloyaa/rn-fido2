import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Authenticator } from './Authenticator.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email!: string;

  @Column({ type: 'varchar', unique: true, nullable: true, length: 20 })
  username!: string | null;

  @Column({ type: 'varchar', length: 500 })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt!: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  lastLoginAt!: Date | null;

  @OneToMany(() => Authenticator, (auth) => auth.user, { lazy: true })
  authenticators!: Promise<Authenticator[]>;
}
