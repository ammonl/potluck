/*
  # BBQ Registrations Database Schema

  1. New Tables
    - `bbq_registrations`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of the person bringing the item
      - `description` (text, required) - Description of what they're bringing
      - `category` (text, required) - Category: side-dish, dessert, drink, or additional
      - `slot_number` (integer, nullable) - For fixed slots (1-3 for side-dish, 1-2 for dessert/drink)
      - `gif_url` (text, nullable) - URL of the Giphy GIF
      - `created_at` (timestamp) - When the registration was created
      - `updated_at` (timestamp) - When the registration was last updated

  2. Security
    - Enable RLS on `bbq_registrations` table
    - Add policy for all users to read all registrations
    - Add policy for all users to insert/update/delete registrations (open BBQ signup)

  3. Constraints
    - Unique constraint on category + slot_number for fixed slots
    - Check constraint to ensure slot_number is valid for each category
*/

CREATE TABLE IF NOT EXISTS bbq_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('side-dish', 'dessert', 'drink', 'additional')),
  slot_number integer,
  gif_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure slot numbers are valid for each category
  CONSTRAINT valid_slot_numbers CHECK (
    (category = 'side-dish' AND slot_number BETWEEN 1 AND 3) OR
    (category = 'dessert' AND slot_number BETWEEN 1 AND 2) OR
    (category = 'drink' AND slot_number BETWEEN 1 AND 2) OR
    (category = 'additional' AND slot_number IS NULL)
  ),
  
  -- Ensure unique slots for fixed categories
  CONSTRAINT unique_category_slot UNIQUE (category, slot_number)
);

-- Enable Row Level Security
ALTER TABLE bbq_registrations ENABLE ROW LEVEL SECURITY;

-- Allow all users to read all registrations (public BBQ signup)
CREATE POLICY "Anyone can view BBQ registrations"
  ON bbq_registrations
  FOR SELECT
  TO public
  USING (true);

-- Allow all users to insert registrations
CREATE POLICY "Anyone can create BBQ registrations"
  ON bbq_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow all users to update registrations
CREATE POLICY "Anyone can update BBQ registrations"
  ON bbq_registrations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow all users to delete registrations
CREATE POLICY "Anyone can delete BBQ registrations"
  ON bbq_registrations
  FOR DELETE
  TO public
  USING (true);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_bbq_registrations_category_slot 
  ON bbq_registrations (category, slot_number);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bbq_registrations_updated_at
  BEFORE UPDATE ON bbq_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();