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
      booking_reminders: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_sent: boolean | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "translator_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
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
      chat_conversations: {
        Row: {
          booking_id: string | null
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          translator_id: string
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          translator_id: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "translator_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators_public"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          contact_info: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          id: string
          industry: string
          industry_ar: string | null
          industry_en: string | null
          industry_ru: string | null
          industry_uz: string | null
          industry_zh: string | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          rating: number | null
          verified: boolean | null
          years_in_business: number | null
        }
        Insert: {
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          industry: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          industry_zh?: string | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          rating?: number | null
          verified?: boolean | null
          years_in_business?: number | null
        }
        Update: {
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          industry?: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          industry_zh?: string | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
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
      embassies: {
        Row: {
          address: string | null
          address_ar: string | null
          address_chinese: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          email: string | null
          emergency_phone: string | null
          id: string
          latitude: number | null
          longitude: number | null
          map_url: string | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          phone: string | null
          type: string
          website: string | null
          working_hours: string | null
          working_hours_ar: string | null
          working_hours_en: string | null
          working_hours_ru: string | null
          working_hours_uz: string | null
          working_hours_zh: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          email?: string | null
          emergency_phone?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          type?: string
          website?: string | null
          working_hours?: string | null
          working_hours_ar?: string | null
          working_hours_en?: string | null
          working_hours_ru?: string | null
          working_hours_uz?: string | null
          working_hours_zh?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          email?: string | null
          emergency_phone?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          type?: string
          website?: string | null
          working_hours?: string | null
          working_hours_ar?: string | null
          working_hours_en?: string | null
          working_hours_ru?: string | null
          working_hours_uz?: string | null
          working_hours_zh?: string | null
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
          category_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          end_date: string
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          start_date: string
          venue: string | null
          venue_ar: string | null
          venue_en: string | null
          venue_ru: string | null
          venue_uz: string | null
          venue_zh: string | null
          website_url: string | null
        }
        Insert: {
          category: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          category_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          end_date: string
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          start_date: string
          venue?: string | null
          venue_ar?: string | null
          venue_en?: string | null
          venue_ru?: string | null
          venue_uz?: string | null
          venue_zh?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string
          category_ar?: string | null
          category_en?: string | null
          category_ru?: string | null
          category_uz?: string | null
          category_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          end_date?: string
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          start_date?: string
          venue?: string | null
          venue_ar?: string | null
          venue_en?: string | null
          venue_ru?: string | null
          venue_uz?: string | null
          venue_zh?: string | null
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
          description_zh: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_zh: string | null
          points_required: number
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_zh?: string | null
          points_required: number
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_zh?: string | null
          points_required?: number
          stock?: number | null
        }
        Relationships: []
      }
      halal_shops: {
        Row: {
          address: string | null
          address_ar: string | null
          address_chinese: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          phone: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      hub_product_categories: {
        Row: {
          category_id: string
          created_at: string
          hub_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          hub_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          hub_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_product_categories_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "production_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      law_firms: {
        Row: {
          address: string | null
          address_ar: string | null
          address_chinese: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          email: string | null
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          phone: string | null
          specialization: string
          specialization_ar: string | null
          specialization_en: string | null
          specialization_ru: string | null
          specialization_uz: string | null
          specialization_zh: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          email?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          specialization: string
          specialization_ar?: string | null
          specialization_en?: string | null
          specialization_ru?: string | null
          specialization_uz?: string | null
          specialization_zh?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          email?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          phone?: string | null
          specialization?: string
          specialization_ar?: string | null
          specialization_en?: string | null
          specialization_ru?: string | null
          specialization_uz?: string | null
          specialization_zh?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      legal_templates: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          file_url: string | null
          id: string
          languages: string[] | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          template_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          file_url?: string | null
          id?: string
          languages?: string[] | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          template_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          file_url?: string | null
          id?: string
          languages?: string[] | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          template_type?: string
        }
        Relationships: []
      }
      market_product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          market_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          market_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          market_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_product_categories_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "wholesale_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      mosques: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
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
          name_zh: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
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
          name_zh?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
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
          name_zh?: string | null
        }
        Relationships: []
      }
      parks: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          park_type: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          park_type?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          park_type?: string | null
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
      product_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          slug?: string
        }
        Relationships: []
      }
      production_hubs: {
        Row: {
          address: string | null
          address_ar: string | null
          address_chinese: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          id: string
          industry: string
          industry_ar: string | null
          industry_en: string | null
          industry_ru: string | null
          industry_uz: string | null
          industry_zh: string | null
          latitude: number | null
          longitude: number | null
          name_zh: string | null
          specializations: string[] | null
          specializations_zh: string[] | null
          travel_tips: string | null
          travel_tips_ar: string | null
          travel_tips_en: string | null
          travel_tips_ru: string | null
          travel_tips_uz: string | null
          travel_tips_zh: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          industry: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          industry_zh?: string | null
          latitude?: number | null
          longitude?: number | null
          name_zh?: string | null
          specializations?: string[] | null
          specializations_zh?: string[] | null
          travel_tips?: string | null
          travel_tips_ar?: string | null
          travel_tips_en?: string | null
          travel_tips_ru?: string | null
          travel_tips_uz?: string | null
          travel_tips_zh?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          id?: string
          industry?: string
          industry_ar?: string | null
          industry_en?: string | null
          industry_ru?: string | null
          industry_uz?: string | null
          industry_zh?: string | null
          latitude?: number | null
          longitude?: number | null
          name_zh?: string | null
          specializations?: string[] | null
          specializations_zh?: string[] | null
          travel_tips?: string | null
          travel_tips_ar?: string | null
          travel_tips_en?: string | null
          travel_tips_ru?: string | null
          travel_tips_uz?: string | null
          travel_tips_zh?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          created_at: string
          description: string | null
          description_zh: string | null
          halal_status: Database["public"]["Enums"]["halal_status"]
          id: string
          image_url: string | null
          ingredients: string[] | null
          manufacturer: string | null
          name: string
          name_zh: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          description?: string | null
          description_zh?: string | null
          halal_status?: Database["public"]["Enums"]["halal_status"]
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          manufacturer?: string | null
          name: string
          name_zh?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          description?: string | null
          description_zh?: string | null
          halal_status?: Database["public"]["Enums"]["halal_status"]
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          manufacturer?: string | null
          name?: string
          name_zh?: string | null
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
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          contact_info: string | null
          country: string
          created_at: string
          cuisine_type: string
          cuisine_type_ar: string | null
          cuisine_type_en: string | null
          cuisine_type_ru: string | null
          cuisine_type_uz: string | null
          cuisine_type_zh: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          halal_status: string | null
          halal_status_note: string | null
          halal_status_note_ar: string | null
          halal_status_note_en: string | null
          halal_status_note_ru: string | null
          halal_status_note_uz: string | null
          halal_status_note_zh: string | null
          has_currency_exchange_nearby: boolean | null
          has_prayer_room: boolean | null
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
          name_zh: string | null
          nearest_metro: string | null
          nearest_metro_ar: string | null
          nearest_metro_en: string | null
          nearest_metro_ru: string | null
          nearest_metro_uz: string | null
          nearest_metro_zh: string | null
          rating: number | null
          rating_cleanliness: number | null
          rating_service: number | null
          rating_taste: number | null
          serves_alcohol: boolean | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          cuisine_type: string
          cuisine_type_ar?: string | null
          cuisine_type_en?: string | null
          cuisine_type_ru?: string | null
          cuisine_type_uz?: string | null
          cuisine_type_zh?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          halal_status?: string | null
          halal_status_note?: string | null
          halal_status_note_ar?: string | null
          halal_status_note_en?: string | null
          halal_status_note_ru?: string | null
          halal_status_note_uz?: string | null
          halal_status_note_zh?: string | null
          has_currency_exchange_nearby?: boolean | null
          has_prayer_room?: boolean | null
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
          name_zh?: string | null
          nearest_metro?: string | null
          nearest_metro_ar?: string | null
          nearest_metro_en?: string | null
          nearest_metro_ru?: string | null
          nearest_metro_uz?: string | null
          nearest_metro_zh?: string | null
          rating?: number | null
          rating_cleanliness?: number | null
          rating_service?: number | null
          rating_taste?: number | null
          serves_alcohol?: boolean | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          cuisine_type?: string
          cuisine_type_ar?: string | null
          cuisine_type_en?: string | null
          cuisine_type_ru?: string | null
          cuisine_type_uz?: string | null
          cuisine_type_zh?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          halal_status?: string | null
          halal_status_note?: string | null
          halal_status_note_ar?: string | null
          halal_status_note_en?: string | null
          halal_status_note_ru?: string | null
          halal_status_note_uz?: string | null
          halal_status_note_zh?: string | null
          has_currency_exchange_nearby?: boolean | null
          has_prayer_room?: boolean | null
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
          name_zh?: string | null
          nearest_metro?: string | null
          nearest_metro_ar?: string | null
          nearest_metro_en?: string | null
          nearest_metro_ru?: string | null
          nearest_metro_uz?: string | null
          nearest_metro_zh?: string | null
          rating?: number | null
          rating_cleanliness?: number | null
          rating_service?: number | null
          rating_taste?: number | null
          serves_alcohol?: boolean | null
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
      service_requests: {
        Row: {
          admin_notes: string | null
          contact_method: string | null
          created_at: string
          description: string | null
          id: string
          service_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          contact_method?: string | null
          created_at?: string
          description?: string | null
          id?: string
          service_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          contact_method?: string | null
          created_at?: string
          description?: string | null
          id?: string
          service_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_malls: {
        Row: {
          address: string | null
          address_ar: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
          address_zh: string | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          city_zh: string | null
          contact_info: string | null
          country: string
          created_at: string
          description: string | null
          description_ar: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          description_zh: string | null
          has_halal_food: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          name_zh: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          has_halal_food?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
          address_zh?: string | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          city_zh?: string | null
          contact_info?: string | null
          country?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          description_zh?: string | null
          has_halal_food?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          name_zh?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      translator_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          specific_date: string | null
          start_time: string
          translator_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time: string
          translator_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time?: string
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "translator_availability_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translator_availability_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators_public"
            referencedColumns: ["id"]
          },
        ]
      }
      translator_bookings: {
        Row: {
          agreed_rate: number
          booking_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          service_type: string
          specialization: string | null
          start_time: string
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          total_hours: number | null
          translator_id: string
          updated_at: string | null
        }
        Insert: {
          agreed_rate: number
          booking_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          service_type: string
          specialization?: string | null
          start_time: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          total_hours?: number | null
          translator_id: string
          updated_at?: string | null
        }
        Update: {
          agreed_rate?: number
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          service_type?: string
          specialization?: string | null
          start_time?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          total_hours?: number | null
          translator_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translator_bookings_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translator_bookings_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators_public"
            referencedColumns: ["id"]
          },
        ]
      }
      translator_reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_public: boolean | null
          language_proficiency: number | null
          overall_rating: number | null
          punctuality: number | null
          rating: number | null
          reliability: number | null
          responded_at: string | null
          translator_id: string
          translator_response: string | null
          user_id: string
          work_expertise: number | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          language_proficiency?: number | null
          overall_rating?: number | null
          punctuality?: number | null
          rating?: number | null
          reliability?: number | null
          responded_at?: string | null
          translator_id: string
          translator_response?: string | null
          user_id: string
          work_expertise?: number | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          language_proficiency?: number | null
          overall_rating?: number | null
          punctuality?: number | null
          rating?: number | null
          reliability?: number | null
          responded_at?: string | null
          translator_id?: string
          translator_response?: string | null
          user_id?: string
          work_expertise?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "translator_reviews_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translator_reviews_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators_public"
            referencedColumns: ["id"]
          },
        ]
      }
      translators: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          bio_ar: string | null
          bio_en: string | null
          bio_ru: string | null
          bio_uz: string | null
          buraq_verified_at: string | null
          buraq_verified_hsk: number | null
          city: string
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          completed_bookings: number | null
          created_at: string
          currency: string | null
          daily_rate: number | null
          email: string | null
          gender: string | null
          has_chinese_driving_license: boolean | null
          has_personal_car: boolean | null
          hourly_rate: number | null
          hsk_level: number | null
          id: string
          intro_video_url: string | null
          is_available: boolean | null
          is_verified: boolean | null
          language_pairs: string[] | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          phone: string | null
          price_per_day: number | null
          rating: number | null
          self_declared_hsk: number | null
          specializations: string[] | null
          telegram_username: string | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          verification_documents: string[] | null
          verified_at: string | null
          whatsapp_number: string | null
          years_experience: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          buraq_verified_at?: string | null
          buraq_verified_hsk?: number | null
          city: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          completed_bookings?: number | null
          created_at?: string
          currency?: string | null
          daily_rate?: number | null
          email?: string | null
          gender?: string | null
          has_chinese_driving_license?: boolean | null
          has_personal_car?: boolean | null
          hourly_rate?: number | null
          hsk_level?: number | null
          id?: string
          intro_video_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          language_pairs?: string[] | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          phone?: string | null
          price_per_day?: number | null
          rating?: number | null
          self_declared_hsk?: number | null
          specializations?: string[] | null
          telegram_username?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_documents?: string[] | null
          verified_at?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          buraq_verified_at?: string | null
          buraq_verified_hsk?: number | null
          city?: string
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          completed_bookings?: number | null
          created_at?: string
          currency?: string | null
          daily_rate?: number | null
          email?: string | null
          gender?: string | null
          has_chinese_driving_license?: boolean | null
          has_personal_car?: boolean | null
          hourly_rate?: number | null
          hsk_level?: number | null
          id?: string
          intro_video_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          language_pairs?: string[] | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          phone?: string | null
          price_per_day?: number | null
          rating?: number | null
          self_declared_hsk?: number | null
          specializations?: string[] | null
          telegram_username?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_documents?: string[] | null
          verified_at?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      travel_checklist_items: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean | null
          is_default: boolean | null
          item_name: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          is_default?: boolean | null
          item_name: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          is_default?: boolean | null
          item_name?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          main_category: string
          sub_categories: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          main_category: string
          sub_categories?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          main_category?: string
          sub_categories?: string[] | null
          updated_at?: string
          user_id?: string
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
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          held_balance: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          held_balance?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          held_balance?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          processed_at: string | null
          reference_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          processed_at?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          processed_at?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "translator_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_markets: {
        Row: {
          address: string | null
          address_ar: string | null
          address_chinese: string | null
          address_en: string | null
          address_ru: string | null
          address_uz: string | null
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
          latitude: number | null
          longitude: number | null
          market_type: string | null
          name: string
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          travel_tips: string | null
          travel_tips_ar: string | null
          travel_tips_en: string | null
          travel_tips_ru: string | null
          travel_tips_uz: string | null
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
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
          latitude?: number | null
          longitude?: number | null
          market_type?: string | null
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          travel_tips?: string | null
          travel_tips_ar?: string | null
          travel_tips_en?: string | null
          travel_tips_ru?: string | null
          travel_tips_uz?: string | null
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          address_chinese?: string | null
          address_en?: string | null
          address_ru?: string | null
          address_uz?: string | null
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
          latitude?: number | null
          longitude?: number | null
          market_type?: string | null
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          travel_tips?: string | null
          travel_tips_ar?: string | null
          travel_tips_en?: string | null
          travel_tips_ru?: string | null
          travel_tips_uz?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      translators_public: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          bio_ar: string | null
          bio_en: string | null
          bio_ru: string | null
          bio_uz: string | null
          buraq_verified_at: string | null
          buraq_verified_hsk: number | null
          city: string | null
          city_ar: string | null
          city_en: string | null
          city_ru: string | null
          city_uz: string | null
          completed_bookings: number | null
          created_at: string | null
          currency: string | null
          daily_rate: number | null
          gender: string | null
          has_chinese_driving_license: boolean | null
          has_personal_car: boolean | null
          hourly_rate: number | null
          hsk_level: number | null
          id: string | null
          intro_video_url: string | null
          is_available: boolean | null
          is_verified: boolean | null
          language_pairs: string[] | null
          name: string | null
          name_ar: string | null
          name_en: string | null
          name_ru: string | null
          name_uz: string | null
          price_per_day: number | null
          rating: number | null
          self_declared_hsk: number | null
          specializations: string[] | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          buraq_verified_at?: string | null
          buraq_verified_hsk?: number | null
          city?: string | null
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          completed_bookings?: number | null
          created_at?: string | null
          currency?: string | null
          daily_rate?: number | null
          gender?: string | null
          has_chinese_driving_license?: boolean | null
          has_personal_car?: boolean | null
          hourly_rate?: number | null
          hsk_level?: number | null
          id?: string | null
          intro_video_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          language_pairs?: string[] | null
          name?: string | null
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          price_per_day?: number | null
          rating?: number | null
          self_declared_hsk?: number | null
          specializations?: string[] | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          buraq_verified_at?: string | null
          buraq_verified_hsk?: number | null
          city?: string | null
          city_ar?: string | null
          city_en?: string | null
          city_ru?: string | null
          city_uz?: string | null
          completed_bookings?: number | null
          created_at?: string | null
          currency?: string | null
          daily_rate?: number | null
          gender?: string | null
          has_chinese_driving_license?: boolean | null
          has_personal_car?: boolean | null
          hourly_rate?: number | null
          hsk_level?: number | null
          id?: string | null
          intro_video_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          language_pairs?: string[] | null
          name?: string | null
          name_ar?: string | null
          name_en?: string | null
          name_ru?: string | null
          name_uz?: string | null
          price_per_day?: number | null
          rating?: number | null
          self_declared_hsk?: number | null
          specializations?: string[] | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_cargo_points: {
        Args: { p_points: number; p_tracking_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_booking_payment: {
        Args: {
          p_agreed_rate: number
          p_booking_date: string
          p_description: string
          p_end_time: string
          p_location: string
          p_service_type: string
          p_specialization: string
          p_start_time: string
          p_total_amount: number
          p_total_hours: number
          p_translator_id: string
        }
        Returns: Json
      }
      redeem_deep_check_points: {
        Args: { p_deep_check_id: string; p_points: number }
        Returns: Json
      }
      redeem_gift: { Args: { p_gift_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      halal_status: "halol" | "haram" | "shubhali"
      payment_status: "pending" | "held" | "released" | "refunded" | "disputed"
      translator_specialization:
        | "medical"
        | "legal"
        | "it"
        | "construction"
        | "manufacturing"
        | "electronics"
        | "furniture"
        | "textile"
        | "automotive"
        | "trade"
        | "tourism"
        | "education"
        | "finance"
        | "general"
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
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      halal_status: ["halol", "haram", "shubhali"],
      payment_status: ["pending", "held", "released", "refunded", "disputed"],
      translator_specialization: [
        "medical",
        "legal",
        "it",
        "construction",
        "manufacturing",
        "electronics",
        "furniture",
        "textile",
        "automotive",
        "trade",
        "tourism",
        "education",
        "finance",
        "general",
      ],
    },
  },
} as const
