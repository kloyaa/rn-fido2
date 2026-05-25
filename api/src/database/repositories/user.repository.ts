import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/User.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: email.toLowerCase().trim(), deletedAt: IsNull() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username: username.toLowerCase().trim(), deletedAt: IsNull() },
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const lower = identifier.toLowerCase().trim();
    return this.repo
      .createQueryBuilder('user')
      .where('(user.email = :id OR user.username = :id) AND user.deletedAt IS NULL', { id: lower })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { email: email.toLowerCase().trim(), deletedAt: IsNull() },
    });
    return count > 0;
  }

  async usernameExists(username: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { username: username.toLowerCase().trim(), deletedAt: IsNull() },
    });
    return count > 0;
  }

  async create(data: { email: string; username?: string; passwordHash: string }): Promise<User> {
    const user = this.repo.create({
      email: data.email.toLowerCase().trim(),
      username: data.username ? data.username.toLowerCase().trim() : null,
      passwordHash: data.passwordHash,
    });
    return this.repo.save(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repo.update(userId, { passwordHash });
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }
}
