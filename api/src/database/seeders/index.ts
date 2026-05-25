import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User.entity';
import { Authenticator } from '../entities/Authenticator.entity';
import { AuditLog } from '../entities/AuditLog.entity';
import { Session } from '../entities/Session.entity';
import runTestUserSeeder from './create-test-user';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'fido2_auth',
  entities: [User, Authenticator, AuditLog, Session],
  synchronize: false,
});

async function runSeeders(): Promise<void> {
  await dataSource.initialize();
  console.log('Database connected. Running seeders...');

  const seeders: Array<{ name: string; run: (ds: DataSource) => Promise<void> }> = [
    { name: 'TestUserSeeder', run: runTestUserSeeder },
  ];

  for (const seeder of seeders) {
    try {
      console.log(`Running seeder: ${seeder.name}`);
      await seeder.run(dataSource);
      console.log(`Seeder ${seeder.name} completed.`);
    } catch (err) {
      console.error(`Seeder ${seeder.name} failed:`, err);
    }
  }

  await dataSource.destroy();
  console.log('Seeding complete.');
}

runSeeders().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
