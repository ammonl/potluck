/*
  # Add header overlay customization

  1. New Columns
    - `header_overlay_color` (text) - CSS color value for the overlay (e.g., 'black', '#000000', 'rgb(0,0,0)')
    - `header_overlay_opacity` (numeric) - Opacity value between 0 and 1

  2. Changes
    - Add columns to potlucks table with sensible defaults
    - Update existing records to use current default values
*/

-- Add header overlay customization columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'potlucks' AND column_name = 'header_overlay_color'
  ) THEN
    ALTER TABLE potlucks ADD COLUMN header_overlay_color text DEFAULT 'black';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'potlucks' AND column_name = 'header_overlay_opacity'
  ) THEN
    ALTER TABLE potlucks ADD COLUMN header_overlay_opacity numeric(3,2) DEFAULT 0.20;
  END IF;
END $$;

-- Add constraint to ensure opacity is between 0 and 1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'potlucks' AND constraint_name = 'potlucks_header_overlay_opacity_check'
  ) THEN
    ALTER TABLE potlucks ADD CONSTRAINT potlucks_header_overlay_opacity_check 
    CHECK (header_overlay_opacity >= 0 AND header_overlay_opacity <= 1);
  END IF;
END $$;