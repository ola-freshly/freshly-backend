import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783487494334 implements MigrationInterface {
    name = 'Migrations1783487494334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."meal-plans_meal_type_enum" AS ENUM('breakfast', 'lunch', 'dinner', 'sidedishes')`);
        await queryRunner.query(`CREATE TABLE "meal-plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "meal_type" "public"."meal-plans_meal_type_enum" NOT NULL, "dishes" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_193e9f1de1f4981038b3159826f" UNIQUE ("user_id", "date", "meal_type"), CONSTRAINT "PK_0e9a70081c8252a63ecbd554297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd3144fdf12d164d0ef8679e2f" ON "meal-plans"  ("user_id", "date") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "weight" numeric`);
        await queryRunner.query(`ALTER TABLE "users" ADD "height" numeric`);
        await queryRunner.query(`CREATE TYPE "public"."users_preferred plan_enum" AS ENUM('gain', 'lose')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "preferred plan" "public"."users_preferred plan_enum"`);
        await queryRunner.query(`ALTER TABLE "meal-plans" ADD CONSTRAINT "FK_67fb1c6d77c56bc9a5fb1c116f6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meal-plans" DROP CONSTRAINT "FK_67fb1c6d77c56bc9a5fb1c116f6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferred plan"`);
        await queryRunner.query(`DROP TYPE "public"."users_preferred plan_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd3144fdf12d164d0ef8679e2f"`);
        await queryRunner.query(`DROP TABLE "meal-plans"`);
        await queryRunner.query(`DROP TYPE "public"."meal-plans_meal_type_enum"`);
    }

}
