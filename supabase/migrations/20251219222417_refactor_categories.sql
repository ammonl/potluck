/*
  # Refactor categories to be per-potluck

  1. Changes
    - Rename `categories` to `default_categories`
    - Create new `categories` table with `potluck_id`
    - Migrate data from `potluck_categories` + `default_categories` to new `categories`
    - Drop `potluck_categories`
    - Add policies for new table

  2. New Tables
    - `categories` (per-potluck)
      - `id` (uuid, primary key)
      - `potluck_id` (uuid, foreign key)
      - `name` (text)
      - ... (fields from default_categories)
      - `slots` (integer)
      - `sort_order` (integer)
      - `is_enabled` (boolean)
      - `source_default_category_id` (uuid, foreign key)

  3. Security
    - Enable RLS
    - Add policies for public read (enabled only) and authenticated management
*/

-- Rename existing categories table to default_categories
ALTER TABLE categories RENAME TO default_categories;

-- Create new categories table for per-potluck configuration
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  potluck_id uuid NOT NULL REFERENCES potlucks(id) ON DELETE CASCADE,
  name text NOT NULL,
  title_en text NOT NULL,
  title_da text NOT NULL,
  singular_en text NOT NULL,
  singular_da text NOT NULL,
  placeholder_en text DEFAULT '',
  placeholder_da text DEFAULT '',
  icon text NOT NULL DEFAULT '📦',
  color_class text NOT NULL DEFAULT 'from-gray-400 to-gray-600',
  slots integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  source_default_category_id uuid REFERENCES default_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(potluck_id, name)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Migration of data
INSERT INTO categories (
  potluck_id,
  name,
  title_en,
  title_da,
  singular_en,
  singular_da,
  placeholder_en,
  placeholder_da,
  icon,
  color_class,
  slots,
  sort_order,
  is_enabled,
  source_default_category_id
)
SELECT
  pc.potluck_id,
  dc.name,
  dc.title_en,
  dc.title_da,
  dc.singular_en,
  dc.singular_da,
  dc.placeholder_en,
  dc.placeholder_da,
  dc.icon,
  dc.color_class,
  dc.slots,
  pc.sort_order,
  pc.is_enabled,
  dc.id
FROM potluck_categories pc
JOIN default_categories dc ON pc.category_id = dc.id;

-- Drop the old junction table
DROP TABLE potluck_categories;

-- Policies for new categories table
CREATE POLICY "Anyone can read enabled categories"
  ON categories
  FOR SELECT
  TO public
  USING (is_enabled = true);

CREATE POLICY "Authenticated users can manage potluck categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
