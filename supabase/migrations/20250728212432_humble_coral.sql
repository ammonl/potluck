/*
  # Add potluck icon field

  1. New Column
    - `icon` (text) - stores the Lucide icon name for the potluck
    - Default to 'Flame' for existing potlucks

  2. Changes
    - Add icon column to potlucks table with default value
*/

ALTER TABLE potlucks ADD COLUMN icon text DEFAULT 'Flame';