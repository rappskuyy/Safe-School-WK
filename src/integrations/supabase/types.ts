export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string | null
          role: string
          child_name: string | null
          child_kelas: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email?: string | null
          role?: string
          child_name?: string | null
          child_kelas?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          role?: string
          child_name?: string | null
          child_kelas?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          nama: string
          kelas: string
          kategori: string
          jenis: string
          cerita: string
          lokasi: string
          bukti_url: string | null
          status: string
          catatan_guru: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama?: string
          kelas: string
          kategori: string
          jenis: string
          cerita: string
          lokasi: string
          bukti_url?: string | null
          status?: string
          catatan_guru?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          kelas?: string
          kategori?: string
          jenis?: string
          cerita?: string
          lokasi?: string
          bukti_url?: string | null
          status?: string
          catatan_guru?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          id: string
          nama: string
          kelas: string
          masalah: string
          jadwal: string
          status: string
          catatan_guru: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          kelas: string
          masalah: string
          jadwal: string
          status?: string
          catatan_guru?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          kelas?: string
          masalah?: string
          jadwal?: string
          status?: string
          catatan_guru?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          id: string
          mood: string
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mood: string
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mood?: string
          session_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kindness_wall: {
        Row: {
          id: string
          name: string | null
          message: string
          status: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          message: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          message?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kindness_wall_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pledges: {
        Row: {
          id: string
          name: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      guru_notifications: {
        Row: {
          id: string
          guru_id: string | null
          type: string
          title: string
          body: string | null
          ref_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          guru_id?: string | null
          type: string
          title: string
          body?: string | null
          ref_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          guru_id?: string | null
          type?: string
          title?: string
          body?: string | null
          ref_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guru_notifications_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      mood_alert_today: {
        Row: {
          mood: string | null
          jumlah: number | null
          tanggal: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_guru: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_ortu: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      app_role: "guru" | "ortu"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends {
  Update: infer U
}
  ? U
  : never

export type Enums<
  EnumName extends keyof DefaultSchema["Enums"],
> = DefaultSchema["Enums"][EnumName]

export const Constants = {
  public: {
    Enums: {
      app_role: ["guru", "ortu"],
    },
  },
} as const
