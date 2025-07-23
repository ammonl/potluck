/*
  # Create potlucks table for generic potluck management

  1. New Tables
    - `potlucks`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title_en` (text) - English title
      - `title_da` (text) - Danish title
      - `subtitle_en` (text) - English subtitle
      - `subtitle_da` (text) - Danish subtitle
      - `footer_en` (text) - English footer text
      - `footer_da` (text) - Danish footer text
      - `event_datetime` (timestamptz) - When the potluck happens
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - When record was last updated
      - `is_active` (boolean) - Whether the potluck is active

  2. Security
    - Enable RLS on `potlucks` table
    - Add policy for public read access
    - Add policy for authenticated users to manage potlucks

  3. Initial Data
    - Insert grillaften2 potluck with provided details
*/

CREATE TABLE IF NOT EXISTS potlucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_da text NOT NULL,
  subtitle_en text NOT NULL,
  subtitle_da text NOT NULL,
  footer_en text NOT NULL,
  footer_da text NOT NULL,
  event_datetime timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE potlucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read potlucks"
  ON potlucks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage potlucks"
  ON potlucks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert the grillaften2 potluck
INSERT INTO potlucks (
  slug,
  title_en,
  title_da,
  subtitle_en,
  subtitle_da,
  footer_en,
  footer_da,
  event_datetime
) VALUES (
  'grillaften2',
  'Grillaften 2: Revenge of the Sausages',
  'Grillaften 2: Pølsernes Hævn',
  'Sign up to bring delicious food & drinks to our epic barbecue!',
  'Tilmeld dig for at medbringe lækker mad og drikke til vores episke grillfest!',
  'Let''s Make This BBQ Epic!',
  'Lad os gøre denne grillfest episk!',
  '2025-07-25 19:00:00+00'
);