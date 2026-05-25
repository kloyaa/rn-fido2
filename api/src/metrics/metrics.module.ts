import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [MetricsController],
})
export class MetricsModule {}
