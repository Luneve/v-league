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
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          id: string
          status: Database["public"]["Enums"]["app_status"]
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          status: Database["public"]["Enums"]["app_status"]
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["app_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string
          id: string
          message: string | null
          opportunity_id: string
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          message?: string | null
          opportunity_id: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          message?: string | null
          opportunity_id?: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          actor_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          details: Json
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          actor_role: Database["public"]["Enums"]["app_role"]
          created_at?: string
          details?: Json
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          actor_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          details?: Json
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_records: {
        Row: {
          application_id: string
          created_at: string
          hours_awarded: number
          id: string
          marked_by: string
          opportunity_id: string
          pdf_url: string | null
          penalty_applied: number
          points_awarded: number
          result: string
          strike_applied: number
          volunteer_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          hours_awarded?: number
          id?: string
          marked_by: string
          opportunity_id: string
          pdf_url?: string | null
          penalty_applied?: number
          points_awarded?: number
          result: string
          strike_applied?: number
          volunteer_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          hours_awarded?: number
          id?: string
          marked_by?: string
          opportunity_id?: string
          pdf_url?: string | null
          penalty_applied?: number
          points_awarded?: number
          result?: string
          strike_applied?: number
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_records_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_records_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_records_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      mini_group_members: {
        Row: {
          id: string
          mini_group_id: string
          season_id: string
          volunteer_id: string
        }
        Insert: {
          id?: string
          mini_group_id: string
          season_id: string
          volunteer_id: string
        }
        Update: {
          id?: string
          mini_group_id?: string
          season_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_group_members_mini_group_id_fkey"
            columns: ["mini_group_id"]
            isOneToOne: false
            referencedRelation: "mini_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mini_group_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mini_group_members_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_groups: {
        Row: {
          created_at: string
          id: string
          league: Database["public"]["Enums"]["league"]
          season_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          league: Database["public"]["Enums"]["league"]
          season_id: string
        }
        Update: {
          created_at?: string
          id?: string
          league?: Database["public"]["Enums"]["league"]
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_groups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link_to: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          age_restriction: number | null
          apply_deadline: string
          capacity: number
          category: string
          city: string
          contacts: Json
          created_at: string
          description: string
          end_date: string
          end_time: string
          id: string
          organization_id: string
          planned_hours: number
          points_reward: number
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["opp_status"]
          title: string
          updated_at: string
        }
        Insert: {
          age_restriction?: number | null
          apply_deadline: string
          capacity: number
          category: string
          city: string
          contacts?: Json
          created_at?: string
          description: string
          end_date: string
          end_time: string
          id?: string
          organization_id: string
          planned_hours?: number
          points_reward: number
          start_date: string
          start_time: string
          status?: Database["public"]["Enums"]["opp_status"]
          title: string
          updated_at?: string
        }
        Update: {
          age_restriction?: number | null
          apply_deadline?: string
          capacity?: number
          category?: string
          city?: string
          contacts?: Json
          created_at?: string
          description?: string
          end_date?: string
          end_time?: string
          id?: string
          organization_id?: string
          planned_hours?: number
          points_reward?: number
          start_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["opp_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          about: string | null
          city: string
          contacts: Json
          created_at: string
          id: string
          links: Json
          name: string
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          about?: string | null
          city: string
          contacts?: Json
          created_at?: string
          id: string
          links?: Json
          name: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          about?: string | null
          city?: string
          contacts?: Json
          created_at?: string
          id?: string
          links?: Json
          name?: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          duration_days: Database["public"]["Enums"]["season_duration"]
          end_date: string
          id: string
          is_active: boolean
          start_date: string
        }
        Insert: {
          created_at?: string
          duration_days?: Database["public"]["Enums"]["season_duration"]
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
        }
        Update: {
          created_at?: string
          duration_days?: Database["public"]["Enums"]["season_duration"]
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
        }
        Relationships: []
      }
      volunteer_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          league: Database["public"]["Enums"]["league"]
          lifetime_hours: number
          nickname: string | null
          season_points: number
          strikes: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city: string
          created_at?: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          league?: Database["public"]["Enums"]["league"]
          lifetime_hours?: number
          nickname?: string | null
          season_points?: number
          strikes?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          league?: Database["public"]["Enums"]["league"]
          lifetime_hours?: number
          nickname?: string | null
          season_points?: number
          strikes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      opportunities_with_counts: {
        Row: {
          age_restriction: number | null
          apply_deadline: string | null
          capacity: number | null
          category: string | null
          city: string | null
          contacts: Json | null
          created_at: string | null
          current_applicants: number | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string | null
          organization_id: string | null
          organization_profiles: Json | null
          planned_hours: number | null
          points_reward: number | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["opp_status"] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fn_accept_candidate: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      fn_apply_to_opportunity: {
        Args: { p_message?: string; p_opportunity_id: string }
        Returns: string
      }
      fn_assign_volunteer_to_group: {
        Args: { p_volunteer_id: string }
        Returns: string
      }
      fn_cancel_opportunity: {
        Args: { p_opportunity_id: string }
        Returns: undefined
      }
      fn_close_expired_opportunities: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fn_create_season: {
        Args: {
          p_duration_days?: Database["public"]["Enums"]["season_duration"]
          p_start_date: string
        }
        Returns: string
      }
      fn_mark_all_notifications_read: { Args: never; Returns: undefined }
      fn_mark_completion: {
        Args: { p_application_id: string; p_result: string }
        Returns: string
      }
      fn_promote_from_waitlist: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      fn_reject_candidate: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      fn_run_season_rollover: { Args: never; Returns: undefined }
      fn_update_opportunity_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["opp_status"]
          p_opportunity_id: string
        }
        Returns: undefined
      }
      fn_verify_organization: { Args: { p_org_id: string }; Returns: undefined }
      fn_waitlist_candidate: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      fn_withdraw_application: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      get_config: { Args: { p_key: string }; Returns: Json }
      get_my_mini_group: { Args: never; Returns: Json }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_org_verified: { Args: never; Returns: boolean }
      next_league: {
        Args: { p_league: Database["public"]["Enums"]["league"] }
        Returns: Database["public"]["Enums"]["league"]
      }
    }
    Enums: {
      app_role: "volunteer" | "organization" | "admin"
      app_status:
        | "applied"
        | "waitlist"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "completed"
        | "no_show"
      league: "bronze" | "silver" | "gold" | "platinum"
      notif_type:
        | "status_change"
        | "update"
        | "cancellation"
        | "completion"
        | "penalty"
        | "strike"
      opp_status: "draft" | "open" | "closed" | "cancelled" | "completed"
      season_duration: "30" | "60" | "90" | "120"
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
      app_role: ["volunteer", "organization", "admin"],
      app_status: [
        "applied",
        "waitlist",
        "accepted",
        "rejected",
        "withdrawn",
        "completed",
        "no_show",
      ],
      league: ["bronze", "silver", "gold", "platinum"],
      notif_type: [
        "status_change",
        "update",
        "cancellation",
        "completion",
        "penalty",
        "strike",
      ],
      opp_status: ["draft", "open", "closed", "cancelled", "completed"],
      season_duration: ["30", "60", "90", "120"],
    },
  },
} as const
