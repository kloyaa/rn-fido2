import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../entities/User.entity';

export default async function (dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(User);

  const email = 'dev@example.com';
  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    console.log(`Test user ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await argon2.hash('DevPassword123!', { type: argon2.argon2id });
  const user = repo.create({ email, username: 'devuser', passwordHash });
  await repo.save(user);
  console.log(`Created test user: ${email}`);
}
