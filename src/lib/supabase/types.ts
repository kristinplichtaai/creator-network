// Database types placeholder
// Generate actual types with: npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      // Add your table types here after generating from Supabase
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
  }
}
