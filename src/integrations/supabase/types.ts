export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cargo_trackings: {
        Row: {
          created_at: string
          destination: string | null
          estimated_delivery: string | null
          id: string
          origin: string | null
          points_earned: number
          status: string
          tracking_number: string
          updated_at: string
          user_id: string
          volume_m3: number | null
        }
        Insert: {
          created_at?: string
          destination?: string | null
          estimated_delivery?: string | null
          id?: string
          origin?: string | null
          points_earned?: number
          status?: string
          tracking_number: string
          updated_at?: string
          user_id: string
          volume_m3?: number | null
        }
        Update: {
          created_at?: string
          destination?: string | null
          estimated_delivery?: string | null
          id?: string
          origin?: string | null
          points_earned?: number
          status?: string
          tracking_number?: string
          updated_at?: string
          user_id?: string
          volume_m3?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          contact_info: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          industry: string
          industry_ar: string | null
          industry_en: string | null
          industry_ru: string | null
          industry_uz: string | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          rating: number | null
          verified: boolean | null
          years_in_business: number | null
        }
        Insert: {
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          industry: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
          verified?: boolean | null
          years_in_business?: number | null
        }
        Update: {
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          industry?: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
          verified?: boolean | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      deep_checks: {
        Row: {
          admin_notes: string | null
          amount_paid: number | null
          created_at: string
          halal_status: string | null
          id: string
          manufacturer_name: string
          payment_type: string
          points_spent: number | null
          product_image_url: string | null
          product_name: string
          report_pdf_url: string | null
          result_summary: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_paid?: number | null
          created_at?: string
          halal_status?: string | null
          id?: string
          manufacturer_name: string
          payment_type: string
          points_spent?: number | null
          product_image_url?: string | null
          product_name: string
          report_pdf_url?: string | null
          result_summary?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number | null
          created_at?: string
          halal_status?: string | null
          id?: string
          manufacturer_name?: string
          payment_type?: string
          points_spent?: number | null
          product_image_url?: string | null
          product_name?: string
          report_pdf_url?: string | null
          result_summary?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exhibitions: {
        Row: {
          category: string
          category_ar: string | null
          category_en: string | null
          category_ru: string | null
          category_uz: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          end_date: string
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          start_date: string
          venue: string | null
          venue_ar: string | null
          venue_en: string | null
          venue_ru: string | null
          venue_uz: string | null
          website_url: string | null
        }
        Insert: {
          category: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          end_date: string
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          start_date: string
          venue?: string | null
          venue_ar?: string | null
          venue_en?: string | null
          venue_ru?: string | null
          venue_uz?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          end_date?: string
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          start_date?: string
          venue?: string | null
          venue_ar?: string | null
          venue_en?: string | null
          venue_ru?: string | null
          venue_uz?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      gift_redemptions: {
        Row: {
          created_at: string
          gift_id: string | null
          id: string
          points_spent: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_id?: string | null
          id?: string
          points_spent: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gift_id?: string | null
          id?: string
          points_spent?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_redemptions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_required: number
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_required: number
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_required?: number
          stock?: number | null
        }
        Relationships: []
      }
      mosques: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          has_friday_prayer: boolean | null
          has_womens_section: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          has_friday_prayer?: boolean | null
          has_womens_section?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          has_friday_prayer?: boolean | null
          has_womens_section?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      production_hubs: {
        Row: {
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          industry: string
          industry_ar: string | null
          industry_en: string | null
          industry_ru: string | null
          industry_uz: string | null
          specializations: string[] | null
        }
        Insert: {
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          industry: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          specializations?: string[] | null
        }
        Update: {
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          industry?: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          specializations?: string[] | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          created_at: string
          description: string | null
          halal_status: Database["public"]["Enums"]["halal_status"]
          id: string
          image_url: string | null
          ingredients: string[] | null
          manufacturer: string | null
          name: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          description?: string | null
          halal_status?: Database["public"]["Enums"]["halal_status"]
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          manufacturer?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          description?: string | null
          halal_status?: Database["public"]["Enums"]["halal_status"]
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          manufacturer?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          contact_info: string | null
          country: string
          created_at: string
          cuisine_type: string
          cuisine_type_ar: string | null
          cuisine_type_en: string | null
          cuisine_type_ru: string | null
          cuisine_type_uz: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          image_url: string | null
          is_halal_certified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          cuisine_type: string
          cuisine_type_ar?: string | null
          cuisine_type_en?: string | null
          cuisine_type_ru?: string | null
          cuisine_type_uz?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          image_url?: string | null
          is_halal_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          cuisine_type?: string
          cuisine_type_ar?: string | null
          cuisine_type_en?: string | null
          cuisine_type_ru?: string | null
          cuisine_type_uz?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          image_url?: string | null
          is_halal_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          place_name: string
          place_type: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          place_name: string
          place_type: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          place_name?: string
          place_type?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          product_id: string | null
          result: Database["public"]["Enums"]["halal_status"]
          scanned_image_url: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id?: string | null
          result: Database["public"]["Enums"]["halal_status"]
          scanned_image_url?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id?: string | null
          result?: Database["public"]["Enums"]["halal_status"]
          scanned_image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_malls: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          contact_info: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          has_halal_food: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          has_halal_food?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          has_halal_food?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_markets: {
        Row: {
          category: string
          category_ar: string | null
          category_en: string | null
          category_ru: string | null
          category_uz: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          contact_info: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
        }
        Insert: {
          category: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
        }
        Update: {
          category?: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      halal_status: "halol" | "haram" | "shubhali"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      halal_status: ["halol", "haram", "shubhali"],
    },
  },
} as const
