export type ProfileRole = 'intern' | 'super_admin';

export interface Profile {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  company?: string;
  role_title?: string;
  bio?: string;
  start_date?: string;
  end_date?: string;
  avatar_url?: string;
  cover_url?: string;
  role: ProfileRole;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  week_number?: number;
  entry_date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  photos?: EntryPhoto[];
}

export interface EntryPhoto {
  id: string;
  entry_id: string;
  profile_id: string;
  storage_path: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  profile_id: string;
  action: string;
  entity?: string;
  entity_id?: string;
  created_at: string;
}
