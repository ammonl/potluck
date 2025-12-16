ALTER TABLE "public"."potlucks" ADD COLUMN "gradient_from" text DEFAULT '#ea580c';
ALTER TABLE "public"."potlucks" ADD COLUMN "gradient_to" text DEFAULT '#ca8a04';

-- Optional: Migrate existing header_overlay_color to gradient_from/to if you wanted to preserve colors,
-- but since we are moving to gradients, the default orange/yellow is a safe fallback for the new UI style.
-- Use a safe update if you want to try to use the old color as the 'from' color:
-- UPDATE "public"."potlucks" SET "gradient_from" = "header_overlay_color", "gradient_to" = "header_overlay_color" WHERE "header_overlay_color" IS NOT NULL;

ALTER TABLE "public"."potlucks" DROP COLUMN "header_overlay_color";
