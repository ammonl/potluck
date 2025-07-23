/*
  # Rename bbq_registrations to potluck_registrations and add potluck_id

  1. Changes
    - Rename `bbq_registrations` table to `potluck_registrations`
    - Add `potluck_id` column with foreign key to potlucks table
    - Update all existing registrations to link to grillaften2 potluck
    - Update indexes and policies for new table name
    - Add new index for potluck_id

  2. Security
    - Maintain existing RLS policies with updated table name
    - Ensure foreign key constraint for data integrity
*/

-- First, get the grillaften2 potluck ID for later use
DO $$
DECLARE
  grillaften2_id uuid;
BEGIN
  SELECT id INTO grillaften2_id FROM potlucks WHERE slug = 'grillaften2';
  
  -- Rename the table
  ALTER TABLE bbq_registrations RENAME TO potluck_registrations;
  
  -- Add potluck_id column
  ALTER TABLE potluck_registrations 
  ADD COLUMN potluck_id uuid REFERENCES potlucks(id) ON DELETE CASCADE;
  
  -- Update all existing registrations to link to grillaften2
  UPDATE potluck_registrations 
  SET potluck_id = grillaften2_id;
  
  -- Make potluck_id NOT NULL after setting values
  ALTER TABLE potluck_registrations 
  ALTER COLUMN potluck_id SET NOT NULL;
END $$;

-- Update indexes (rename existing ones and add new one)
DROP INDEX IF EXISTS idx_bbq_registrations_category_slot;
DROP INDEX IF EXISTS idx_bbq_registrations_created_at;

CREATE INDEX idx_potluck_registrations_potluck_id 
  ON potluck_registrations(potluck_id);

CREATE INDEX idx_potluck_registrations_category_slot 
  ON potluck_registrations(potluck_id, category, slot_number);

CREATE INDEX idx_potluck_registrations_created_at 
  ON potluck_registrations(created_at);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can delete bbq registrations" ON potluck_registrations;
DROP POLICY IF EXISTS "Anyone can insert bbq registrations" ON potluck_registrations;
DROP POLICY IF EXISTS "Anyone can read bbq registrations" ON potluck_registrations;
DROP POLICY IF EXISTS "Anyone can update bbq registrations" ON potluck_registrations;

CREATE POLICY "Anyone can read potluck registrations"
  ON potluck_registrations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert potluck registrations"
  ON potluck_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update potluck registrations"
  ON potluck_registrations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete potluck registrations"
  ON potluck_registrations
  FOR DELETE
  TO public
  USING (true);

-- Update the trigger name
DROP TRIGGER IF EXISTS update_bbq_registrations_updated_at ON potluck_registrations;

CREATE TRIGGER update_potluck_registrations_updated_at
  BEFORE UPDATE ON potluck_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();