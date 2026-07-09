import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1783254828685 implements MigrationInterface {
  name = 'Migrations1783254828685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pantry_items_source_enum" AS ENUM('manual', 'ai', 'barcode')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD "source" "public"."pantry_items_source_enum" NOT NULL DEFAULT 'manual'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pantry_items_ai_processing_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD "ai_processing_status" "public"."pantry_items_ai_processing_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD "ai_confidence" numeric`,
    );
    await queryRunner.query(`ALTER TABLE "pantry_items" ADD "ocr_result" text`);
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD "usage_instruction" text`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b5d03311c61873076311ea7b6" ON "pantry_items"  ("expiry_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc6eea4e447b18fc4eb0127805" ON "pantry_items"  ("user_id", "category") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc6eea4e447b18fc4eb0127805"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b5d03311c61873076311ea7b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN "usage_instruction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN "ocr_result"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN "ai_confidence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN "ai_processing_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."pantry_items_ai_processing_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "pantry_items" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."pantry_items_source_enum"`);
  }
}
