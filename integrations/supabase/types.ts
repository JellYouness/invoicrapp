export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      admin_analytics: {
        Row: {
          id: string;
          date: string;
          total_users: number;
          new_users_today: number;
          active_users_last_7_days: number;
          active_users_last_30_days: number;
          total_invoices: number;
          invoices_created_today: number;
          invoices_created_this_week: number;
          invoices_created_this_month: number;
          total_revenue: number;
          revenue_today: number;
          revenue_this_week: number;
          revenue_this_month: number;
          free_users: number;
          pro_users: number;
          total_clients: number;
          avg_invoices_per_user: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          total_users?: number;
          new_users_today?: number;
          active_users_last_7_days?: number;
          active_users_last_30_days?: number;
          total_invoices?: number;
          invoices_created_today?: number;
          invoices_created_this_week?: number;
          invoices_created_this_month?: number;
          total_revenue?: number;
          revenue_today?: number;
          revenue_this_week?: number;
          revenue_this_month?: number;
          free_users?: number;
          pro_users?: number;
          total_clients?: number;
          avg_invoices_per_user?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_users?: number;
          new_users_today?: number;
          active_users_last_7_days?: number;
          active_users_last_30_days?: number;
          total_invoices?: number;
          invoices_created_today?: number;
          invoices_created_this_week?: number;
          invoices_created_this_month?: number;
          total_revenue?: number;
          revenue_today?: number;
          revenue_this_week?: number;
          revenue_this_month?: number;
          free_users?: number;
          pro_users?: number;
          total_clients?: number;
          avg_invoices_per_user?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          tax_number: string | null;
          website: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          tax_number?: string | null;
          website?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          tax_number?: string | null;
          website?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          invoice_number: string;
          client_name: string;
          client_address: string;
          client_email: string | null;
          client_phone: string | null;
          invoice_date: string;
          due_date: string;
          theme_id: string;
          theme_name: string;
          items: any;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_number: string;
          client_name: string;
          client_address: string;
          client_email?: string | null;
          client_phone?: string | null;
          invoice_date: string;
          due_date: string;
          theme_id: string;
          theme_name: string;
          items: any;
          subtotal: number;
          tax_amount?: number;
          total_amount: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invoice_number?: string;
          client_name?: string;
          client_address?: string;
          client_email?: string | null;
          client_phone?: string | null;
          invoice_date?: string;
          due_date?: string;
          theme_id?: string;
          theme_name?: string;
          items?: any;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          company_name: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
          user_id: string;
          role: string | null;
        };
        Insert: {
          company_name?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id: string;
          role?: string | null;
        };
        Update: {
          company_name?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id?: string;
          role?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          status: string;
          invoices_created_this_month: number;
          invoice_limit: number;
          usage_reset_date: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: string;
          status?: string;
          invoices_created_this_month?: number;
          invoice_limit?: number;
          usage_reset_date?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: string;
          status?: string;
          invoices_created_this_month?: number;
          invoice_limit?: number;
          usage_reset_date?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          company_email: string | null;
          company_phone: string | null;
          company_address: string | null;
          company_website: string | null;
          company_logo: string | null;
          default_theme: string | null;
          default_currency: string | null;
          default_tax_rate: number | null;
          default_payment_terms: string | null;
          default_notes: string | null;
          email_notifications: boolean | null;
          payment_reminders: boolean | null;
          invoice_updates: boolean | null;
          marketing_emails: boolean | null;
          date_format: string | null;
          number_format: string | null;
          timezone: string | null;
          language: string | null;
          invoice_prefix: string | null;
          invoice_counter: number | null;
          invoice_number_format: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          company_email?: string | null;
          company_phone?: string | null;
          company_address?: string | null;
          company_website?: string | null;
          company_logo?: string | null;
          default_theme?: string | null;
          default_currency?: string | null;
          default_tax_rate?: number | null;
          default_payment_terms?: string | null;
          default_notes?: string | null;
          email_notifications?: boolean | null;
          payment_reminders?: boolean | null;
          invoice_updates?: boolean | null;
          marketing_emails?: boolean | null;
          date_format?: string | null;
          number_format?: string | null;
          timezone?: string | null;
          language?: string | null;
          invoice_prefix?: string | null;
          invoice_counter?: number | null;
          invoice_number_format?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string | null;
          company_email?: string | null;
          company_phone?: string | null;
          company_address?: string | null;
          company_website?: string | null;
          company_logo?: string | null;
          default_theme?: string | null;
          default_currency?: string | null;
          default_tax_rate?: number | null;
          default_payment_terms?: string | null;
          default_notes?: string | null;
          email_notifications?: boolean | null;
          payment_reminders?: boolean | null;
          invoice_updates?: boolean | null;
          marketing_emails?: boolean | null;
          date_format?: string | null;
          number_format?: string | null;
          timezone?: string | null;
          language?: string | null;
          invoice_prefix?: string | null;
          invoice_counter?: number | null;
          invoice_number_format?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_admin_analytics: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      is_admin: {
        Args: {
          user_uuid?: string;
        };
        Returns: boolean;
      };
      is_super_admin: {
        Args: {
          user_uuid?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
