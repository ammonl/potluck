-- Drop potential old check constraints that might enforce specific text values
ALTER TABLE potluck_registrations DROP CONSTRAINT IF EXISTS bbq_registrations_category_check;
ALTER TABLE potluck_registrations DROP CONSTRAINT IF EXISTS potluck_registrations_category_check;

-- Update registration category references to use the new potluck-specific category id
-- We join on potluck_id and match the current category (which holds the source default category id) 
-- to the source_default_category_id of the new categories table.
UPDATE potluck_registrations pr
SET category = c.id::text
FROM categories c
WHERE c.potluck_id = pr.potluck_id
  AND c.name = pr.category;

-- Now convert the column to UUID
-- Note: This will fail if there are any values in 'category' that are not valid UUIDs.
-- If previous migrations enforced UUIDs or the app only wrote UUIDs, this is safe.
ALTER TABLE potluck_registrations
  ALTER COLUMN category TYPE uuid USING category::uuid;

-- Add Foreign Key constraint to ensure referential integrity with the categories table
ALTER TABLE potluck_registrations
  ADD CONSTRAINT potluck_registrations_category_fkey
  FOREIGN KEY (category)
  REFERENCES categories(id)
  ON DELETE CASCADE;
