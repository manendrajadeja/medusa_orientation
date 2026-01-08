import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260108075500 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "title" text NULL;`);
    }

    override async down(): Promise<void> {
        this.addSql(`ALTER TABLE "review" DROP COLUMN IF EXISTS "title";`);
    }

}
