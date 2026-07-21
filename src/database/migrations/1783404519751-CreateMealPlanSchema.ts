import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMealPlanSchema1783404519751 implements MigrationInterface {
  name = 'CreateMealPlanSchema1783404519751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "meal_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6270d3206d074e2a2520f8d0a0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal_plan_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meal_plan_id" uuid NOT NULL, "recipe_id" uuid NOT NULL, "meal_date" date NOT NULL, "meal_type" character varying(50) NOT NULL, CONSTRAINT "PK_0e5334892bf0438597bb4a8e58e" PRIMARY KEY ("id"))`,
    );
    // NOTE: is_verified / verification_token / refresh_token_hash are already
    // created by InitialSchema, so they are intentionally NOT added here.
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_a94a25c51cc9b60a3c542c98986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_items" ADD CONSTRAINT "FK_eea2b55fcd4567872f94d2ec2e7" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_items" ADD CONSTRAINT "FK_55ea4fbbcac5390eb6fee328491" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meal_plan_items" DROP CONSTRAINT "FK_55ea4fbbcac5390eb6fee328491"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_items" DROP CONSTRAINT "FK_eea2b55fcd4567872f94d2ec2e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_a94a25c51cc9b60a3c542c98986"`,
    );
    // is_verified / verification_token / refresh_token_hash are owned by
    // InitialSchema, so they are not dropped here.
    await queryRunner.query(`DROP TABLE "meal_plan_items"`);
    await queryRunner.query(`DROP TABLE "meal_plans"`);
  }
}
