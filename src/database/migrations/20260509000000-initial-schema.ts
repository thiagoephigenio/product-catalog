import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema20260509000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"         uuid        NOT NULL,
        "name"       varchar     NOT NULL,
        "parent_id"  uuid,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name"   UNIQUE ("name"),
        CONSTRAINT "PK_categories"        PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id")
          REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "product_status_enum" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED')
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"          uuid                  NOT NULL,
        "name"        varchar               NOT NULL,
        "description" text,
        "status"      "product_status_enum" NOT NULL DEFAULT 'DRAFT',
        "created_at"  TIMESTAMP             NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP             NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_attributes" (
        "id"         uuid    NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid    NOT NULL,
        "key"        varchar NOT NULL,
        "value"      varchar NOT NULL,
        CONSTRAINT "PK_product_attributes"              PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_attributes_product_key"  UNIQUE ("product_id", "key"),
        CONSTRAINT "FK_product_attributes_product"      FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "product_id"  uuid NOT NULL,
        "category_id" uuid NOT NULL,
        CONSTRAINT "PK_product_categories"          PRIMARY KEY ("product_id", "category_id"),
        CONSTRAINT "FK_product_categories_product"  FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_categories_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"             uuid      NOT NULL DEFAULT gen_random_uuid(),
        "event_type"     varchar   NOT NULL,
        "aggregate_id"   uuid      NOT NULL,
        "aggregate_type" varchar   NOT NULL,
        "payload"        jsonb     NOT NULL,
        "correlation_id" varchar,
        "occurred_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "product_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
  }
}
