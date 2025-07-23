DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

-- Remove is_active column from categories table
ALTER TABLE categories DROP COLUMN is_active;

-- Update the policy to no longer reference is_active
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true); 