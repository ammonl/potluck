/*
  # Create BBQ Registrations Table

  1. New Tables
    - `bbq_registrations`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of the person bringing the item
      - `description` (text, not null) - Description of what they're bringing
      - `category` (text, not null) - Category: side-dish, dessert, drink, or additional
      - `slot_number` (integer, nullable) - Slot position for fixed categories
      - `gif_url` (text, nullable) - URL of the associated GIF
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `bbq_registrations` table
    - Add policy for anyone to read registrations
    - Add policy for anyone to insert/update registrations
    - Add policy for anyone to delete registrations

  3. Indexes
    - Add index on category and slot_number for efficient queries
*/

-- Create the bbq_registrations table
CREATE TABLE IF NOT EXISTS bbq_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('side-dish', 'dessert', 'drink', 'additional')),
  slot_number integer,
  gif_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bbq_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a community BBQ signup)
CREATE POLICY "Anyone can read bbq registrations"
  ON bbq_registrations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert bbq registrations"
  ON bbq_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update bbq registrations"
  ON bbq_registrations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete bbq registrations"
  ON bbq_registrations
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bbq_registrations_category_slot 
  ON bbq_registrations (category, slot_number);

CREATE INDEX IF NOT EXISTS idx_bbq_registrations_created_at 
  ON bbq_registrations (created_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bbq_registrations_updated_at
  BEFORE UPDATE ON bbq_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();