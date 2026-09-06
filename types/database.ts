export type Profile = {
  id: string;
  nama: string;
  email: string;
  unit_kerja: string;
  status_pegawai:
    | "Pegawai Aktif Direktorat/Bidang Investigasi"
    | "Diaspora (pernah bekerja di Direktorat/Bidang Investigasi)"
    | null;
  minat_jersey: "Ya" | "Tidak" | null;
  bib_number: number;
  role: "peserta" | "admin" | "admin_utama";
  foto_profil: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  tanggal_aktivitas: string; // date, ISO yyyy-mm-dd
  waktu_mulai: string; // time, HH:MM:SS
  jarak_km: number;
  durasi: string; // interval, e.g. "01:23:45"
  waktu_selesai: string; // time, generated
  pace: string; // interval, generated
  heart_rate: number | null;
  elevation_gain: number | null;
  bukti_strava: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSettings = {
  id: boolean;
  target_km: number;
  race_start: string;
  race_end: string;
};

export type LeaderboardRow = {
  user_id: string;
  nama: string;
  unit_kerja: string;
  bib_number: number;
  total_km: number;
  total_entry: number;
  total_durasi: string;
  avg_pace: string | null;
  rank: number;
};

export type RaceCategoryRow = {
  user_id: string;
  nama: string;
  unit_kerja: string;
  bib_number: number;
  total_km: number;
  avg_pace_seconds: number | null;
  total_elevation: number;
  max_streak: number;
  streak_end_date: string | null;
  last_activity_at: string | null;
};

export type RaceUnitSummaryRow = {
  unit_kerja: string;
  total_km: number;
  total_entry: number;
  total_durasi: string;
  avg_pace_seconds: number | null;
  member_count: number;
  active_member_count: number;
};

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  actor_nama: string;
  aksi: "hapus_aktivitas" | "hapus_peserta" | "ubah_role" | "ubah_pengaturan_event";
  detail: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      activities: {
        Row: Activity;
        Insert: Partial<Activity> & {
          user_id: string;
          tanggal_aktivitas: string;
          waktu_mulai: string;
          jarak_km: number;
          durasi: string;
        };
        Update: Partial<Activity>;
      };
      admin_audit_log: {
        Row: AuditLogRow;
        Insert: never;
        Update: never;
      };
      event_settings: {
        Row: EventSettings;
        Insert: Partial<EventSettings>;
        Update: Partial<EventSettings>;
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardRow;
      };
      race_categories: {
        Row: RaceCategoryRow;
      };
      race_unit_summary: {
        Row: RaceUnitSummaryRow;
      };
    };
  };
};
