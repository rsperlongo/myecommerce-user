import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserProfilesMigration20260911120000 implements MigrationInterface {
  name = 'UserProfilesMigration20260911120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "uf" character varying(2) NOT NULL,
        "married" boolean NOT NULL,
        "churchMember" boolean NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_profiles_email" PRIMARY KEY ("email"),
        CONSTRAINT "FK_user_profiles_users_email"
          FOREIGN KEY ("email") REFERENCES "users"("email")
          ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "user_profiles"');
  }
}
