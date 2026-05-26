import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/database/entities/User.entity';
import { Authenticator } from './src/database/entities/Authenticator.entity';
import { AuditLog } from './src/database/entities/AuditLog.entity';
import { Session } from './src/database/entities/Session.entity';

dotenv.config({ path: ['.env.local', '.env'] });

const isRemoteHost = !['localhost', '127.0.0.1'].includes(process.env.DB_HOST ?? 'localhost');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'fido2_auth',
  ssl: isRemoteHost ? { rejectUnauthorized: false } : false,
  entities: [User, Authenticator, AuditLog, Session],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});
