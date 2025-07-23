/*
  # Add header background field to potlucks

  1. Changes
    - Add `header_background` column to potlucks table
    - Set default value to current background image
    - Allow NULL values for flexibility

  2. Notes
    - Existing potlucks will use the default background
    - Admins can customize per potluck
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'potlucks' AND column_name = 'header_background'
  ) THEN
    ALTER TABLE potlucks ADD COLUMN header_background text DEFAULT '/background.JPG';
  END IF;
END $$;