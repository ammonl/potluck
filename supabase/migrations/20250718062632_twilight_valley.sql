/*
  # Update BBQ categories

  1. Changes
    - Add 'main-dish' and 'other' categories to the existing check constraint
    - This allows the new categories to be stored in the database

  2. Categories
    - side-dish: Side dishes
    - dessert: Desserts  
    - drink: Drinks
    - main-dish: Main dishes (hot dogs, buns, other meat, fire)
    - other: Other items (plates, cups, utensils, napkins)
    - additional: Additional items
*/

-- Drop the existing check constraint
ALTER TABLE bbq_registrations DROP CONSTRAINT IF EXISTS bbq_registrations_category_check;

-- Add the updated check constraint with new categories
ALTER TABLE bbq_registrations ADD CONSTRAINT bbq_registrations_category_check 
  CHECK (category = ANY (ARRAY['side-dish'::text, 'dessert'::text, 'drink'::text, 'main-dish'::text, 'other'::text, 'additional'::text]));