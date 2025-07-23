/*
  # Add potluck categories management

  1. New Tables
    - `potluck_categories`
      - `id` (uuid, primary key)
      - `potluck_id` (uuid, foreign key to potlucks)
      - `category_id` (uuid, foreign key to categories)
      - `sort_order` (integer)
      - `is_enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `potluck_categories` table
    - Add policies for authenticated users to manage potluck categories
    - Add policies for public users to read enabled categories

  3. Changes
    - Create junction table to link potlucks with categories
    - Add sort ordering and enable/disable functionality
    - Add unique constraint on potluck_id + category_id
*/

CREATE TABLE IF NOT EXISTS potluck_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  potluck_id uuid NOT NULL REFERENCES potlucks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(potluck_id, category_id)
);

ALTER TABLE potluck_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled potluck categories"
  ON potluck_categories
  FOR SELECT
  TO public
  USING (is_enabled = true);

CREATE POLICY "Authenticated users can manage potluck categories"
  ON potluck_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_potluck_categories_potluck_sort 
  ON potluck_categories (potluck_id, sort_order, is_enabled);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_potluck_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_potluck_categories_updated_at
  BEFORE UPDATE ON potluck_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_potluck_categories_updated_at();