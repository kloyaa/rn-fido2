import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuthenticatorTable1779696161670 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'authenticators',
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
            isNullable: false,
          },
          {
            name: 'credentialId',
            type: 'bytea',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'publicKey',
            type: 'bytea',
            isNullable: false,
          },
          {
            name: 'attestationData',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'enrolledAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'lastUsedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deviceName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'signCounter',
            type: 'bigint',
            isNullable: false,
            default: '0',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '10',
            isNullable: false,
            default: `'active'`,
          },
          {
            name: 'revokedAt',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_authenticators_userId',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_authenticators_status',
            columnNames: ['status'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_authenticators_userId',
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'CHK_authenticators_status',
            expression: `"status" IN ('active', 'revoked')`,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE if exists "authenticators" cascade`);
  }

}
