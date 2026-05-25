import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authenticator } from '../entities/Authenticator.entity';

@Injectable()
export class AuthenticatorRepository {
  constructor(
    @InjectRepository(Authenticator)
    private readonly repo: Repository<Authenticator>,
  ) {}

  async findByCredentialId(credentialId: Buffer): Promise<Authenticator | null> {
    return this.repo.findOne({ where: { credentialId } });
  }

  async findActiveByUserId(userId: string): Promise<Authenticator[]> {
    return this.repo.find({ where: { userId, status: 'active' } });
  }

  async findById(id: string): Promise<Authenticator | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Authenticator | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async create(data: {
    userId: string;
    credentialId: Buffer;
    publicKey: Buffer;
    deviceName: string;
    attestationData?: object;
    signCounter: number;
  }): Promise<Authenticator> {
    const auth = this.repo.create({
      userId: data.userId,
      credentialId: data.credentialId,
      publicKey: data.publicKey,
      deviceName: data.deviceName,
      attestationData: data.attestationData ?? null,
      signCounter: data.signCounter,
      status: 'active',
    });
    return this.repo.save(auth);
  }

  async updateUsage(id: string, signCounter: number): Promise<void> {
    await this.repo.update(id, { signCounter, lastUsedAt: new Date() });
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update(id, { status: 'revoked', revokedAt: new Date() });
  }

  async countActiveByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, status: 'active' } });
  }
}
