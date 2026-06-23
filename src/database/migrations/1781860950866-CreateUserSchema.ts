import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSchema1781860950866 implements MigrationInterface {
  name = 'CreateUserSchema1781860950866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "password_hash" character varying NOT NULL, "avatar_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "cuisine" character varying(100), "servings" integer, "cook_time" integer, "instructions" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorite_recipes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "recipe_id" uuid, CONSTRAINT "PK_ebdd8b2f049e5c52f71916b2b12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(100) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nutrition_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "week_start" date NOT NULL, "protein_ratio" numeric NOT NULL, "vegetable_ratio" numeric NOT NULL, "fruit_ratio" numeric NOT NULL, "nutrition_score" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_dd9d41be1c628a937e0faceb41b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pantry_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "quantity" numeric NOT NULL, "unit" character varying(50) NOT NULL, "category" character varying(100), "barcode" character varying, "image_url" character varying(500), "purchase_date" date, "expiry_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_bb63c18ae1bc99152edd69c4a61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_ingredients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipe_id" uuid NOT NULL, "ingredient_name" character varying NOT NULL, "quantity" numeric, "unit" character varying(50), CONSTRAINT "PK_8f15a314e55970414fc92ffb532" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "youtube_imports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "youtube_url" text NOT NULL, "video_title" character varying, "extracted_recipe" jsonb, "imported_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_3d7f795e37e5307f85e01292a98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_recipes" ADD CONSTRAINT "FK_b8eb1e0a0b29728bb97f5bd1333" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_recipes" ADD CONSTRAINT "FK_0bab1dfb655aadd347282013fbb" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nutrition_logs" ADD CONSTRAINT "FK_5f014ded97166b5596ba790100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD CONSTRAINT "FK_ec53d8efe916b7c27605c885148" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_imports" ADD CONSTRAINT "FK_bf94b1f2c377305cc9ab7c56fc6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "youtube_imports" DROP CONSTRAINT "FK_bf94b1f2c377305cc9ab7c56fc6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP CONSTRAINT "FK_ec53d8efe916b7c27605c885148"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nutrition_logs" DROP CONSTRAINT "FK_5f014ded97166b5596ba790100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_recipes" DROP CONSTRAINT "FK_0bab1dfb655aadd347282013fbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_recipes" DROP CONSTRAINT "FK_b8eb1e0a0b29728bb97f5bd1333"`,
    );
    await queryRunner.query(`DROP TABLE "youtube_imports"`);
    await queryRunner.query(`DROP TABLE "recipe_ingredients"`);
    await queryRunner.query(`DROP TABLE "pantry_items"`);
    await queryRunner.query(`DROP TABLE "nutrition_logs"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "favorite_recipes"`);
    await queryRunner.query(`DROP TABLE "recipes"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
