import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1783487375874 implements MigrationInterface {
  name = 'Migrations1783487375874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "weight" numeric`);
    await queryRunner.query(`ALTER TABLE "users" ADD "height" numeric`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_preferred plan_enum" AS ENUM('gain', 'lose')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "preferred plan" "public"."users_preferred plan_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferred plan"`);
    await queryRunner.query(`DROP TYPE "public"."users_preferred plan_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight"`);
  }
}
