/*
  # Add event organizer fields to potlucks table

  1. New Columns
    - `organizer_name` (text, optional) - Name of the event organizer
    - `organizer_email` (text, optional) - Email contact for the organizer
  
  2. Changes
    - Add organizer contact fields to potlucks table
    - Fields are optional to maintain backward compatibility
*/

-- Add organizer fields to potlucks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'potlucks' AND column_name = 'organizer_name'
  ) THEN
    ALTER TABLE potlucks ADD COLUMN organizer_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'potlucks' AND column_name = 'organizer_email'
  ) THEN
    ALTER TABLE potlucks ADD COLUMN organizer_email text;
  END IF;
END $$;