import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSessionTable1779696186514 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
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
            name: 'createdAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'inactivityExpiresAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'lastActivityAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: false,
          },
          {
            name: 'deviceIdentifier',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'revokedAt',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_sessions_userId',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_sessions_expiresAt',
            columnNames: ['expiresAt'],
          },
          {
            name: 'IDX_sessions_revokedAt',
            columnNames: ['revokedAt'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_sessions_userId',
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE if exists "sessions" cascade`);
  }

}
