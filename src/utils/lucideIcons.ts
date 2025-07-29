import * as LucideIcons from 'lucide-react';

// Popular icons for potlucks and events
export const POPULAR_POTLUCK_ICONS = [
  'Flame', 'Utensils', 'ChefHat', 'Coffee', 'Wine', 'Beer', 'Cake', 'Pizza',
  'Heart', 'Apple', 'Cherry', 'Grape', 'Sandwich', 'IceCream', 'Cookie', 
  'Soup', 'Fish', 'Beef', 'Salad', 'Croissant', 'Donut', 'Candy', 'Lollipop'
];

// All available icons (filtered to exclude very technical ones)
export const ALL_POTLUCK_ICONS = [
  'Apple', 'Award', 'Balloon', 'Beef', 'Beer', 'Bell', 'Bike', 
  'Building', 'Cake', 'Calendar', 'Candy', 'Car', 'ChefHat', 
  'Cherry', 'Clock', 'Clover', 'Coffee', 'Compass', 
  'Cookie', 'Croissant', 'Crown', 'Donut', 'Drum', 'Fish', 'Flag', 
  'Flame', 'Flower', 'Frown', 'Gift', 'Globe', 'Grape', 'Guitar', 
  'Headphones', 'Heart', 'Home', 'IceCream', 'Laugh', 
  'Leaf', 'Lightbulb', 'Lollipop', 'MapPin', 'Medal', 'Megaphone', 
  'Meh', 'Mic', 'Moon', 'Mountain', 'Music', 'Navigation', 
  'PartyPopper', 'Piano', 'Pizza', 'Plane', 'Rainbow', 'Rocket', 
  'Salad', 'Sandwich', 'Smile', 'Snowflake', 'Soup', 'Sparkles', 
  'Star', 'Store', 'Sun', 'Tent', 'ThumbsUp', 'Timer', 'TreePine', 
  'Trophy', 'Umbrella', 'User', 'UserCheck', 'UserPlus', 'Users', 
  'Utensils', 'Waves', 'Wine', 'Zap'
];

export const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Flame; // Fallback to Flame
};