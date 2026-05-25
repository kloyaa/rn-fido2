import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../database/entities/User.entity';
import { Authenticator } from '../database/entities/Authenticator.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { Session } from '../database/entities/Session.entity';

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.database'),
  entities: [User, Authenticator, AuditLog, Session],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: config.get<boolean>('database.logging'),
  migrationsRun: false,
});
