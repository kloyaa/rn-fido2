import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuditlogTable1779696130518 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
        new Table({
            name: 'audit_logs',
            columns: [
            {
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                generationStrategy: 'uuid',
                default: 'uuid_generate_v4()',
            },
            {
                name: 'userId',
                type: 'uuid',
                isNullable: true,
            },
            {
                name: 'eventType',
                type: 'varchar',
                length: '50',
                isNullable: false,
            },
            {
                name: 'timestamp',
                type: 'timestamptz',
                isNullable: false,
                default: 'NOW()',
            },
            {
                name: 'ipAddress',
                type: 'varchar',
                length: '45',
                isNullable: false,
            },
            {
                name: 'deviceInfo',
                type: 'jsonb',
                isNullable: true,
            },
            {
                name: 'result',
                type: 'varchar',
                length: '20',
                isNullable: false,
            },
            {
                name: 'errorMessage',
                type: 'varchar',
                length: '500',
                isNullable: true,
            },
            {
                name: 'sessionId',
                type: 'uuid',
                isNullable: true,
            },
            ],
            indices: [
            {
                name: 'IDX_audit_logs_userId_timestamp',
                columnNames: ['userId', 'timestamp'],
            },
            {
                name: 'IDX_audit_logs_eventType_timestamp',
                columnNames: ['eventType', 'timestamp'],
            },
            {
                name: 'IDX_audit_logs_ipAddress_timestamp',
                columnNames: ['ipAddress', 'timestamp'],
            },
            {
                name: 'IDX_audit_logs_result',
                columnNames: ['result'],
            },
            ],
            checks: [
            {
                name: 'CHK_audit_logs_result',
                expression: `"result" IN ('success', 'failure', 'suspended')`,
            },
            ],
        }),
        true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE if exists "audit_logs" cascade`);
    }

}
