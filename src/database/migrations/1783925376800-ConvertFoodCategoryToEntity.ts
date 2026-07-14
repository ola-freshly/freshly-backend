import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertFoodCategoryToEntity1783925376800 implements MigrationInterface {
    name = 'ConvertFoodCategoryToEntity1783925376800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pantry_items" DROP CONSTRAINT "FK_pantry_items_category_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_pantry_items_user_category"`);
        await queryRunner.query(`CREATE INDEX "IDX_80e2e8536b3c98f9f95faad033" ON "pantry_items"  ("user_id", "category_id") `);
        await queryRunner.query(`ALTER TABLE "pantry_items" ADD CONSTRAINT "FK_1fa43ef40deb545745888faca8c" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pantry_items" DROP CONSTRAINT "FK_1fa43ef40deb545745888faca8c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80e2e8536b3c98f9f95faad033"`);
        await queryRunner.query(`CREATE INDEX "IDX_pantry_items_user_category" ON "pantry_items" USING btree ("user_id", "category_id") `);
        await queryRunner.query(`ALTER TABLE "pantry_items" ADD CONSTRAINT "FK_pantry_items_category_id" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
