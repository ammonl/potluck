/*
  # Create categories table for customizable food categories

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique identifier for the category)
      - `title_en` (text, English title like "Main Dishes")
      - `title_da` (text, Danish title like "Hovedretter")
      - `singular_en` (text, English singular like "Main Dish")
      - `singular_da` (text, Danish singular like "Hovedret")
      - `placeholder_en` (text, English placeholder text)
      - `placeholder_da` (text, Danish placeholder text)
      - `icon` (text, emoji icon for the category)
      - `color_class` (text, CSS color class for styling)
      - `sort_order` (integer, for ordering categories)
      - `is_active` (boolean, whether category is available)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for public read access
    - Add policy for authenticated users to manage categories

  3. Default Data
    - Insert default categories matching current system
    - Maintain backward compatibility with existing registrations
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_da text NOT NULL,
  singular_en text NOT NULL,
  singular_da text NOT NULL,
  placeholder_en text DEFAULT '',
  placeholder_da text DEFAULT '',
  icon text NOT NULL DEFAULT '📦',
  color_class text NOT NULL DEFAULT 'from-gray-400 to-gray-600',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories (sort_order, name);

-- Insert default categories
INSERT INTO categories (name, title_en, title_da, singular_en, singular_da, placeholder_en, placeholder_da, icon, color_class, sort_order) VALUES
('main-dish', 'Main Dishes', 'Hovedretter', 'Main Dish', 'Hovedret', 'Hot dogs, buns, other meat, fire', 'Pølser, pølsebrød, andet kød, ild', '🍖', 'from-red-400 to-red-600', 1),
('side-dish', 'Side Dishes', 'Tilbehør', 'Side Dish', 'Tilbehør', '', '', '🥗', 'from-green-400 to-green-600', 2),
('dessert', 'Desserts', 'Desserter', 'Dessert', 'Dessert', '', '', '🍰', 'from-pink-400 to-pink-600', 3),
('drink', 'Drinks', 'Drikkevarer', 'Drink', 'Drikkevare', '', '', '🥤', 'from-blue-400 to-blue-600', 4),
('other', 'Other', 'Andet', 'Other', 'Andet', 'Plates, cups, utensils, napkins', 'Tallerkener, kopper, bestik, servietter', '🍽️', 'from-purple-400 to-purple-600', 5),
('additional', 'Additional Items', 'Ekstra Ting', 'Additional', 'Ekstra', '', '', '📦', 'from-orange-400 to-orange-600', 6);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();