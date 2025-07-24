export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          title_en: string
          title_da: string
          singular_en: string
          singular_da: string
          placeholder_en: string
          placeholder_da: string
          icon: string
          color_class: string
          slots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_en: string
          title_da: string
          singular_en: string
          singular_da: string
          placeholder_en?: string
          placeholder_da?: string
          icon?: string
          color_class?: string
          slots?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_en?: string
          title_da?: string
          singular_en?: string
          singular_da?: string
          placeholder_en?: string
          placeholder_da?: string
          icon?: string
          color_class?: string
          slots?: number
          created_at?: string
          updated_at?: string
        }
      }
      potluck_categories: {
        Row: {
          id: string
          potluck_id: string
          category_id: string
          sort_order: number
          is_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          potluck_id: string
          category_id: string
          sort_order?: number
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          potluck_id?: string
          category_id?: string
          sort_order?: number
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      potluck_registrations: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          slot_number: number | null
          gif_url: string | null
          footer_en: string
          footer_da: string
          event_datetime: string
          is_active: boolean
          header_background: string | null
          header_overlay_color: string
          header_overlay_opacity: number
          footer_emojis: string | null
          organizer_name: string | null
          organizer_email: string | null
          created_at: string
          updated_at: string
          potluck_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          slot_number?: number | null
          gif_url?: string | null
          footer_en?: string
          footer_da?: string
          event_datetime?: string
          is_active?: boolean
          header_background?: string | null
          header_overlay_color?: string
          header_overlay_opacity?: number
          footer_emojis?: string | null
          organizer_name?: string | null
          organizer_email?: string | null
          created_at?: string
          updated_at?: string
          potluck_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          slot_number?: number | null
          gif_url?: string | null
          footer_en?: string
          footer_da?: string
          event_datetime?: string
          is_active?: boolean
          header_background?: string | null
          header_overlay_color?: string
          header_overlay_opacity?: number
          footer_emojis?: string | null
          organizer_name?: string | null
          organizer_email?: string | null
          created_at?: string
          updated_at?: string
          potluck_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}