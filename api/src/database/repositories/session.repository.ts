import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Session } from '../entities/Session.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repo: Repository<Session>,
  ) {}

  async create(data: {
    userId: string;
    ipAddress: string;
    deviceIdentifier?: string;
  }): Promise<Session> {
    const now = new Date();
    const session = this.repo.create({
      userId: data.userId,
      ipAddress: data.ipAddress,
      deviceIdentifier: data.deviceIdentifier ?? null,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      inactivityExpiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      lastActivityAt: now,
    });
    return this.repo.save(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.repo.findOne({ where: { id, revokedAt: IsNull() } });
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update(id, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Session)
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();
  }

  async updateActivity(id: string): Promise<void> {
    const now = new Date();
    await this.repo.update(id, {
      lastActivityAt: now,
      inactivityExpiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
  }
}
