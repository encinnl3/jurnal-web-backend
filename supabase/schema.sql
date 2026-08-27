CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  company       TEXT,
  role_title    TEXT,
  bio           TEXT,
  start_date    DATE,
  end_date      DATE,
  avatar_url    TEXT,
  cover_url     TEXT,
  role          TEXT NOT NULL DEFAULT 'intern' CHECK (role IN ('intern', 'super_admin')),
  display_order INTEGER DEFAULT 99,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  week_number   INTEGER,
  entry_date    DATE NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE entry_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  caption       TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity        TEXT,
  entity_id     UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles_intern_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_public_read" ON journal_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "entries_intern_write" ON journal_entries FOR ALL TO authenticated USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "photos_public_read" ON entry_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "photos_intern_write" ON entry_photos FOR ALL TO authenticated USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION check_max_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles WHERE role = 'intern') >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 intern profiles reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_profiles
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'intern')
  EXECUTE FUNCTION check_max_profiles();
