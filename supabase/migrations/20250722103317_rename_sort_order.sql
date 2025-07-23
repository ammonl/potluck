-- Rename sort_order column to slots in categories table
ALTER TABLE categories RENAME COLUMN sort_order TO slots;

-- Update the index to use the new column name
DROP INDEX IF EXISTS idx_categories_sort_order;
