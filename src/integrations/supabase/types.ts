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
      appointments: {
        Row: {
          clinic_id: string
          created_at: string
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          procedure_id: string | null
          status: string | null
          time: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          date: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          procedure_id?: string | null
          status?: string | null
          time: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          procedure_id?: string | null
          status?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          active: boolean | null
          clinic_id: string
          created_at: string
          delay_days: number | null
          id: string
          message_template: string | null
          name: string
          trigger_event: string
          type: string
        }
        Insert: {
          active?: boolean | null
          clinic_id: string
          created_at?: string
          delay_days?: number | null
          id?: string
          message_template?: string | null
          name: string
          trigger_event: string
          type: string
        }
        Update: {
          active?: boolean | null
          clinic_id?: string
          created_at?: string
          delay_days?: number | null
          id?: string
          message_template?: string | null
          name?: string
          trigger_event?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          id: string
          name: string
          procedure_id: string | null
          quantity: number | null
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          id?: string
          name: string
          procedure_id?: string | null
          quantity?: number | null
          unit_price?: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          id?: string
          name?: string
          procedure_id?: string | null
          quantity?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          clinic_id: string
          created_at: string
          discount: number | null
          id: string
          installments: number | null
          loss_reason: string | null
          notes: string | null
          patient_id: string
          payment_method: string | null
          status: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          discount?: number | null
          id?: string
          installments?: number | null
          loss_reason?: string | null
          notes?: string | null
          patient_id: string
          payment_method?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          discount?: number | null
          id?: string
          installments?: number | null
          loss_reason?: string | null
          notes?: string | null
          patient_id?: string
          payment_method?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          owner_email: string
          owner_name: string
          phone: string | null
          primary_color: string | null
          state: string | null
          status: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          owner_email: string
          owner_name: string
          phone?: string | null
          primary_color?: string | null
          state?: string | null
          status?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          owner_email?: string
          owner_name?: string
          phone?: string | null
          primary_color?: string | null
          state?: string | null
          status?: string | null
        }
        Relationships: []
      }
      consent_terms: {
        Row: {
          active: boolean
          clinic_id: string
          content: string
          created_at: string
          id: string
          title: string
          version: number
        }
        Insert: {
          active?: boolean
          clinic_id: string
          content: string
          created_at?: string
          id?: string
          title?: string
          version?: number
        }
        Update: {
          active?: boolean
          clinic_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "consent_terms_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_installments: {
        Row: {
          amount: number
          budget_id: string
          clinic_id: string
          created_at: string
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_at: string | null
          patient_id: string
          payment_method: string | null
          status: string
          total_installments: number
          updated_at: string
        }
        Insert: {
          amount?: number
          budget_id: string
          clinic_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_at?: string | null
          patient_id: string
          payment_method?: string | null
          status?: string
          total_installments?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          budget_id?: string
          clinic_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_at?: string | null
          patient_id?: string
          payment_method?: string | null
          status?: string
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_installments_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_installments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_installments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          clinic_id: string
          comment: string | null
          created_at: string
          id: string
          patient_id: string
          score: number
        }
        Insert: {
          clinic_id: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          score: number
        }
        Update: {
          clinic_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_consents: {
        Row: {
          clinic_id: string
          consent_term_id: string | null
          consent_type: string
          consented: boolean
          consented_at: string
          id: string
          ip_address: string | null
          patient_id: string
          revoked_at: string | null
        }
        Insert: {
          clinic_id: string
          consent_term_id?: string | null
          consent_type?: string
          consented?: boolean
          consented_at?: string
          id?: string
          ip_address?: string | null
          patient_id: string
          revoked_at?: string | null
        }
        Update: {
          clinic_id?: string
          consent_term_id?: string | null
          consent_type?: string
          consented?: boolean
          consented_at?: string
          id?: string
          ip_address?: string | null
          patient_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_consents_consent_term_id_fkey"
            columns: ["consent_term_id"]
            isOneToOne: false
            referencedRelation: "consent_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          clinic_id: string
          cpf: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          clinic_id: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          clinic_id?: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          active: boolean | null
          category: string | null
          clinic_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          clinic_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean | null
          category?: string | null
          clinic_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "procedures_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          clinic_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "platform_admin"
        | "clinic_owner"
        | "clinic_staff"
        | "clinic_receptionist"
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
      app_role: [
        "platform_admin",
        "clinic_owner",
        "clinic_staff",
        "clinic_receptionist",
      ],
    },
  },
} as const
