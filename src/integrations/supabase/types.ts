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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      absensi: {
        Row: {
          created_at: string
          id: string
          keterangan: string | null
          nis: string
          status: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          keterangan?: string | null
          nis: string
          status: string
          tanggal: string
        }
        Update: {
          created_at?: string
          id?: string
          keterangan?: string | null
          nis?: string
          status?: string
          tanggal?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          created_at: string
          id: string
          jadwal: string
          kelas: string
          masalah: string
          nama: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          jadwal: string
          kelas: string
          masalah: string
          nama: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          jadwal?: string
          kelas?: string
          masalah?: string
          nama?: string
          status?: string
        }
        Relationships: []
      }
      jadwal_pelajaran: {
        Row: {
          created_at: string
          guru: string
          hari: string
          id: string
          jam_mulai: string
          jam_selesai: string
          kelas: string
          mapel: string
          ruang: string | null
        }
        Insert: {
          created_at?: string
          guru: string
          hari: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          kelas: string
          mapel: string
          ruang?: string | null
        }
        Update: {
          created_at?: string
          guru?: string
          hari?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          kelas?: string
          mapel?: string
          ruang?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
        }
        Relationships: []
      }
      nilai: {
        Row: {
          created_at: string
          id: string
          mapel: string
          nilai: number
          nis: string
          semester: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapel: string
          nilai: number
          nis: string
          semester: string
        }
        Update: {
          created_at?: string
          id?: string
          mapel?: string
          nilai?: number
          nis?: string
          semester?: string
        }
        Relationships: []
      }
      pencapaian: {
        Row: {
          badge: string
          created_at: string
          deskripsi: string | null
          id: string
          nis: string
          poin: number
        }
        Insert: {
          badge: string
          created_at?: string
          deskripsi?: string | null
          id?: string
          nis: string
          poin?: number
        }
        Update: {
          badge?: string
          created_at?: string
          deskripsi?: string | null
          id?: string
          nis?: string
          poin?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          child_nis: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          kelas: string | null
          nis: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          child_nis?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          kelas?: string | null
          nis?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          child_nis?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kelas?: string | null
          nis?: string | null
          role?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          cerita: string
          created_at: string
          id: string
          jenis: string
          kelas: string
          lokasi: string
          nama: string
          status: string
        }
        Insert: {
          cerita: string
          created_at?: string
          id?: string
          jenis: string
          kelas: string
          lokasi: string
          nama: string
          status?: string
        }
        Update: {
          cerita?: string
          created_at?: string
          id?: string
          jenis?: string
          kelas?: string
          lokasi?: string
          nama?: string
          status?: string
        }
        Relationships: []
      }
      tugas: {
        Row: {
          created_at: string
          deadline: string
          deskripsi: string | null
          id: string
          judul: string
          kelas: string
          mapel: string
        }
        Insert: {
          created_at?: string
          deadline: string
          deskripsi?: string | null
          id?: string
          judul: string
          kelas: string
          mapel: string
        }
        Update: {
          created_at?: string
          deadline?: string
          deskripsi?: string | null
          id?: string
          judul?: string
          kelas?: string
          mapel?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      is_approved_staff: { Args: { _user_id: string }; Returns: boolean }
      is_parent_of: {
        Args: { _nis: string; _user_id: string }
        Returns: boolean
      }
      nis_of: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "guru" | "siswa" | "ortu"
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
      app_role: ["admin", "guru", "siswa", "ortu"],
    },
  },
} as const
