import { MigrationInterface, QueryRunner } from 'typeorm';

export class MembersMigration20260911130000 implements MigrationInterface {
  name = 'MembersMigration20260911130000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "uf" character varying(2) NOT NULL,
        "married" boolean NOT NULL DEFAULT false,
        "churchMember" boolean NOT NULL DEFAULT true,
        "memberSince" date NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_members_users_email"
          FOREIGN KEY ("email") REFERENCES "users"("email")
          ON UPDATE CASCADE ON DELETE SET NULL,
        CONSTRAINT "CHK_members_church_member" CHECK ("churchMember" = true)
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_members_email"
      ON "members" ("email") WHERE "email" IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "members"');
  }
}
