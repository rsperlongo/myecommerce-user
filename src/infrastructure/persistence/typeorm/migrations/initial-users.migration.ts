import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsersMigration20260904191000 implements MigrationInterface {
  name = 'InitialUsersMigration20260904191000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM ('admin', 'manager', 'user', 'guest');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "roles" "user_role_enum"[] NOT NULL DEFAULT ARRAY['user']::"user_role_enum"[],
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TYPE IF EXISTS "user_role_enum"');
  }
}
