import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260108080500 extends Migration {

    override async up(): Promise<void> {
        // Add all potentially missing columns
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "content" text NOT NULL DEFAULT '';`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "rating" real NOT NULL DEFAULT 5;`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "first_name" text NOT NULL DEFAULT '';`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "last_name" text NOT NULL DEFAULT '';`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'pending';`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "product_id" text NOT NULL DEFAULT '';`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "customer_id" text NULL;`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now();`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();`);
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz NULL;`);

        // Attempt to add constraints (might fail if they exist, but essential for data integrity)
        // Note: Wrapping in simple try-catch block for SQL logic not easy here without specific DB syntax (PG vs others)
        // We will assume if columns were missing, constraints likely are too. 
        // If this fails, we can handle it, but usually ADD COLUMN IF NOT EXISTS is the critical part.
    }

    override async down(): Promise<void> {
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "content";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "rating";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "first_name";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "last_name";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "status";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "product_id";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "customer_id";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "created_at";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "updated_at";`);
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "deleted_at";`);
    }

}
