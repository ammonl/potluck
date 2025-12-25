export interface Category {
  id: string;
  potluck_id: string;
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
  sort_order: number;
  is_enabled: boolean;
  source_default_category_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DefaultCategory {
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