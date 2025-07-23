/*
  # Remove category name column and update references

  1. Schema Changes
    - Remove name column from categories table
    - Update potluck_registrations.category to reference categories.id (UUID)
    - Update check constraint to allow any category ID
    - Add foreign key constraint for category reference

  2. Data Migration
    - Update existing registrations to use category UUIDs instead of names
    - Handle the mapping from old string names to new UUIDs

  3. Constraints
    - Remove old check constraint on category names
    - Add foreign key constraint for data integrity
*/

-- First, let's add a temporary column to store the new category IDs
ALTER TABLE potluck_registrations ADD COLUMN category_id uuid;

-- Update the category_id column with the appropriate UUIDs based on existing category names
-- We'll map the old string names to the category IDs
UPDATE potluck_registrations 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE (
    (potluck_registrations.category = 'main-dish' AND c.title_en = 'Main Dishes') OR
    (potluck_registrations.category = 'side-dish' AND c.title_en = 'Side Dishes') OR
    (potluck_registrations.category = 'dessert' AND c.title_en = 'Desserts') OR
    (potluck_registrations.category = 'drink' AND c.title_en = 'Drinks') OR
    (potluck_registrations.category = 'other' AND c.title_en = 'Other') OR
    (potluck_registrations.category = 'additional' AND c.title_en = 'Additional Items')
  )
  LIMIT 1
);

-- For any registrations that couldn't be mapped, try to find a category by partial match
UPDATE potluck_registrations 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.title_en ILIKE '%' || potluck_registrations.category || '%'
  LIMIT 1
)
WHERE category_id IS NULL;

-- If there are still unmapped registrations, assign them to a default category (Other)
UPDATE potluck_registrations 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.title_en = 'Other'
  LIMIT 1
)
WHERE category_id IS NULL;

-- Now make the category_id column NOT NULL
ALTER TABLE potluck_registrations ALTER COLUMN category_id SET NOT NULL;

-- Drop the old category column and its constraint
ALTER TABLE potluck_registrations DROP CONSTRAINT IF EXISTS bbq_registrations_category_check;
ALTER TABLE potluck_registrations DROP COLUMN category;

-- Rename the new column to category
ALTER TABLE potluck_registrations RENAME COLUMN category_id TO category;

-- Add foreign key constraint
ALTER TABLE potluck_registrations 
ADD CONSTRAINT potluck_registrations_category_fkey 
FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE;

END $$;