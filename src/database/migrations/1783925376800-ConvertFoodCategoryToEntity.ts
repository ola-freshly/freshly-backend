import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertFoodCategoryToEntity1783925376800
  implements MigrationInterface
{
  name = 'ConvertFoodCategoryToEntity1783925376800';

  private readonly categories: Array<{ name: string; slug: string }> = [
    { name: 'Dairy', slug: 'dairy' },
    { name: 'Vegetable', slug: 'vegetable' },
    { name: 'Fruit', slug: 'fruit' },
    { name: 'Meat', slug: 'meat' },
    { name: 'Seafood', slug: 'seafood' },
    { name: 'Grain', slug: 'grain' },
    { name: 'Spice', slug: 'spice' },
    { name: 'Beverage', slug: 'beverage' },
    { name: 'Snack', slug: 'snack' },
    { name: 'Condiment', slug: 'condiment' },
    { name: 'Other', slug: 'other' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the food_categories table (maps to the FoodCategory entity).
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "food_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_food_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_food_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_food_categories" PRIMARY KEY ("id")
      )
    `);

    // 2. Seed the canonical categories (idempotent).
    const values = this.categories
      .map((c) => `(uuid_generate_v4(), '${c.name}', '${c.slug}')`)
      .join(', ');
    await queryRunner.query(`
      INSERT INTO "food_categories" ("id", "name", "slug")
      VALUES ${values}
      ON CONFLICT ("slug") DO NOTHING
    `);

    // 3. Add the new FK column (nullable).
    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD COLUMN IF NOT EXISTS "category_id" uuid`,
    );

    // 4. Backfill category_id from the old free-text "category" column, if present.
    const hasOldColumn: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pantry_items' AND column_name = 'category'
      ) AS "exists"
    `);
    if (hasOldColumn[0]?.exists) {
      await queryRunner.query(`
        UPDATE "pantry_items" p
        SET "category_id" = fc."id"
        FROM "food_categories" fc
        WHERE p."category_id" IS NULL
          AND lower(trim(p."category")) = fc."slug"
      `);
    }

    // 5. Drop the old composite index on (user_id, category) if it exists.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_cc6eea4e447b18fc4eb0127805"`,
    );

    // 6. Drop the old free-text column.
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN IF EXISTS "category"`,
    );

    // 7. Recreate the composite index on the new column.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_80e2e8536b3c98f9f95faad033" ON "pantry_items" ("user_id", "category_id")`,
    );

    // 8. Add the foreign key.
    await queryRunner.query(`
      ALTER TABLE "pantry_items"
      ADD CONSTRAINT "FK_1fa43ef40deb545745888faca8c"
      FOREIGN KEY ("category_id") REFERENCES "food_categories"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: restore the free-text "category" column and drop the relation.
    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP CONSTRAINT IF EXISTS "FK_1fa43ef40deb545745888faca8c"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_80e2e8536b3c98f9f95faad033"`,
    );

    await queryRunner.query(
      `ALTER TABLE "pantry_items" ADD COLUMN IF NOT EXISTS "category" character varying(100)`,
    );
    await queryRunner.query(`
      UPDATE "pantry_items" p
      SET "category" = fc."slug"
      FROM "food_categories" fc
      WHERE p."category_id" = fc."id"
    `);

    await queryRunner.query(
      `ALTER TABLE "pantry_items" DROP COLUMN IF EXISTS "category_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cc6eea4e447b18fc4eb0127805" ON "pantry_items" ("user_id", "category")`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "food_categories"`);
  }
}
