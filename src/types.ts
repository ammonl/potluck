export interface Category {
  id: string;
  name: string;
  title_en: string;
  title_da: string;
  singular_en: string;
  singular_da: string;
  placeholder_en: string;
  placeholder_da: string;
  icon: string;
  color_class: string;
  slots: number;
  created_at?: string;
  updated_at?: string;
}

export interface PotluckCategory {
  id: string;
  potluck_id: string;
  category_id: string;
  sort_order: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category; // Joined category data
}

export interface Registration {
  id: string;
  name: string;
  description: string;
  category: string; // Allow any category name for dynamic categories
  slot_number?: number | null;
  gif_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MainItem {
  id: string;
  name: string;
  description: string;
  gif_url: string;
}

export interface PotluckData {
  [key: string]: (Registration | null)[] | Registration[];
}