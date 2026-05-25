import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1779696099968 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'passwordHash',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'deletedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_users_createdAt',
            columnNames: ['createdAt'],
          },
          {
            name: 'IDX_users_deletedAt',
            columnNames: ['deletedAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE if exists "users" cascade`);
  }

}
