import type { WeddingContent } from "./schema";

/**
 * Hand-written rather than generated. Two tables is not worth a codegen step,
 * and typing `content` as WeddingContent (instead of Json) means the compiler
 * catches shape mistakes at the query, not at runtime.
 */
export type Database = {
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string;
          slug: string;
          edit_token: string;
          owner_id: string | null;
          is_published: boolean;
          theme: string;
          primary_color: string;
          bg_color: string;
          content: WeddingContent;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          edit_token?: string;
          owner_id?: string | null;
          is_published?: boolean;
          theme?: string;
          primary_color?: string;
          bg_color?: string;
          content: WeddingContent;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weddings"]["Insert"]>;
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          wedding_id: string;
          guest_name: string;
          email: string | null;
          attending: boolean;
          party_size: number;
          dietary: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          guest_name: string;
          email?: string | null;
          attending: boolean;
          party_size?: number;
          dietary?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvps"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
