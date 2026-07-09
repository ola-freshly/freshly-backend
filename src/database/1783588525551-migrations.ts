import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783588525551 implements MigrationInterface {
    name = 'Migrations1783588525551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorite_recipes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "recipe_id" uuid, CONSTRAINT "PK_ebdd8b2f049e5c52f71916b2b12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(100) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nutrition_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "week_start" date NOT NULL, "protein_ratio" numeric NOT NULL, "vegetable_ratio" numeric NOT NULL, "fruit_ratio" numeric NOT NULL, "nutrition_score" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_dd9d41be1c628a937e0faceb41b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "youtube_imports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "youtube_url" text NOT NULL, "video_title" character varying, "extracted_recipe" jsonb, "imported_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_3d7f795e37e5307f85e01292a98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favorite_recipes" ADD CONSTRAINT "FK_b8eb1e0a0b29728bb97f5bd1333" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite_recipes" ADD CONSTRAINT "FK_0bab1dfb655aadd347282013fbb" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nutrition_logs" ADD CONSTRAINT "FK_5f014ded97166b5596ba790100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "youtube_imports" ADD CONSTRAINT "FK_bf94b1f2c377305cc9ab7c56fc6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "youtube_imports" DROP CONSTRAINT "FK_bf94b1f2c377305cc9ab7c56fc6"`);
        await queryRunner.query(`ALTER TABLE "nutrition_logs" DROP CONSTRAINT "FK_5f014ded97166b5596ba790100e"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "favorite_recipes" DROP CONSTRAINT "FK_0bab1dfb655aadd347282013fbb"`);
        await queryRunner.query(`ALTER TABLE "favorite_recipes" DROP CONSTRAINT "FK_b8eb1e0a0b29728bb97f5bd1333"`);
        await queryRunner.query(`DROP TABLE "youtube_imports"`);
        await queryRunner.query(`DROP TABLE "nutrition_logs"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "favorite_recipes"`);
    }

}
