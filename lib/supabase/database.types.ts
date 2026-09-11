export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          phone_verified: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      payment_orders: {
        Row: {
          txnid: string;
          user_id: string;
          course_slug: string;
          subtotal_paise: number;
          gst_paise: number;
          total_paise: number;
          currency: string;
          status: string;
          payu_mihpayid: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          txnid: string;
          user_id: string;
          course_slug: string;
          subtotal_paise: number;
          gst_paise: number;
          total_paise: number;
          currency?: string;
          status?: string;
          payu_mihpayid?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_orders"]["Insert"]>;
        Relationships: [];
      };
      course_entitlements: {
        Row: {
          user_id: string;
          course_slug: string;
          source_txnid: string;
          granted_at: string;
          revoked_at: string | null;
        };
        Insert: {
          user_id: string;
          course_slug: string;
          source_txnid: string;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["course_entitlements"]["Insert"]>;
        Relationships: [];
      };
      payment_events: {
        Row: {
          id: number;
          txnid: string | null;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          txnid?: string | null;
          event_type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["payment_events"]["Insert"], "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      finalize_course_purchase: {
        Args: { p_txnid: string; p_mihpayid: string | null; p_verified_status: string };
        Returns: undefined;
      };
      mark_course_payment_inactive: {
        Args: { p_txnid: string; p_status: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
