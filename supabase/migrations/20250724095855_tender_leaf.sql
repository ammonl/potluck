/*
  # Add footer emojis field to potlucks

  1. Changes
    - Add `footer_emojis` column to potlucks table
    - Set default value to the current emoji line
    - Make it optional (nullable)

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE potlucks 
ADD COLUMN footer_emojis text DEFAULT '🍖 🌭 🍔 🥩 🌽 🍺 🎉';