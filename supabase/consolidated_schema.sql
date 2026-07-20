-- Consolidated Supabase Schema Migration Script
-- This script drops old, basic tables and initializes the complete schema required by the Next.js portfolio.

-- 1. CLEAN UP EXISTING OLD TABLES (to avoid conflicts)
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.community_games CASCADE;
DROP TABLE IF EXISTS public.youtube_videos CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.statistics CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.gallery_content CASCADE;
DROP TABLE IF EXISTS public.gallery_categories CASCADE;
DROP TABLE IF EXISTS public.wave_top_games CASCADE;
DROP TABLE IF EXISTS public.wave_top_members CASCADE;
DROP TABLE IF EXISTS public.waves CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.event_gallery CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.team_member_seasons CASCADE;
DROP TABLE IF EXISTS public.core_team_members CASCADE;
DROP TABLE IF EXISTS public.seasons CASCADE;
DROP TABLE IF EXISTS public.founders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop projects/team tables that exist in production but aren't part of the new schema
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.team CASCADE;

-- Drop old types if they exist
DROP TYPE IF EXISTS media_type;

-- 2. CREATE SCHEMAS & TYPES
CREATE TYPE media_type AS ENUM ('image', 'video');

-- Users extended profile
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'student',
    linkedin TEXT,
    github TEXT,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founders
CREATE TABLE public.founders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    linkedin_url TEXT,
    photo TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons
CREATE TABLE public.seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Team Members (season_id removed for Many-to-Many support)
CREATE TABLE public.core_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    linkedin_url TEXT,
    photo TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Member Seasons (Junction Table for Many-to-Many relationship)
CREATE TABLE public.team_member_seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.core_team_members(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, season_id)
);

-- Events
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    rich_content TEXT,
    cover_image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Gallery
CREATE TABLE public.event_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    src TEXT NOT NULL,
    media_type media_type DEFAULT 'image',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    level TEXT,
    duration TEXT,
    tools TEXT,
    short_description TEXT,
    outline TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waves
CREATE TABLE public.waves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    banner TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wave Top Members
CREATE TABLE public.wave_top_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wave_id UUID REFERENCES public.waves(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rank TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wave Top Games
CREATE TABLE public.wave_top_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wave_id UUID REFERENCES public.waves(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    game_cover TEXT,
    itch_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Categories
CREATE TABLE public.gallery_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Content
CREATE TABLE public.gallery_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
    title TEXT,
    src TEXT NOT NULL,
    media_type media_type DEFAULT 'image',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Statistics
CREATE TABLE public.statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    students_count INTEGER DEFAULT 0,
    graduates_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners
CREATE TABLE public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Videos
CREATE TABLE public.youtube_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    thumbnail TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Games
CREATE TABLE public.community_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    team TEXT,
    itch_url TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings (for the star rating system)
CREATE TABLE public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visitor_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, item_type, visitor_id)
);

-- 3. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wave_top_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wave_top_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select policies (Allow anyone to read data)
CREATE POLICY "Allow public read founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public read seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Allow public read core_team_members" ON public.core_team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read team_member_seasons" ON public.team_member_seasons FOR SELECT USING (true);
CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read event_gallery" ON public.event_gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read waves" ON public.waves FOR SELECT USING (true);
CREATE POLICY "Allow public read wave_top_members" ON public.wave_top_members FOR SELECT USING (true);
CREATE POLICY "Allow public read wave_top_games" ON public.wave_top_games FOR SELECT USING (true);
CREATE POLICY "Allow public read gallery_categories" ON public.gallery_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read gallery_content" ON public.gallery_content FOR SELECT USING (true);
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read statistics" ON public.statistics FOR SELECT USING (true);
CREATE POLICY "Allow public read partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Allow public read youtube_videos" ON public.youtube_videos FOR SELECT USING (true);
CREATE POLICY "Allow public read community_games" ON public.community_games FOR SELECT USING (true);
CREATE POLICY "Allow public read ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Insert/Update policies for ratings (allow anyone to submit ratings)
CREATE POLICY "Allow public insert ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ratings" ON public.ratings FOR UPDATE USING (true);

-- Allow authenticated users (admin) to INSERT on all tables
CREATE POLICY "Authenticated insert founders" ON public.founders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert seasons" ON public.seasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert core_team_members" ON public.core_team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert team_member_seasons" ON public.team_member_seasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert event_gallery" ON public.event_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert waves" ON public.waves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert wave_top_members" ON public.wave_top_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert wave_top_games" ON public.wave_top_games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert gallery_categories" ON public.gallery_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert gallery_content" ON public.gallery_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert statistics" ON public.statistics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert youtube_videos" ON public.youtube_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert community_games" ON public.community_games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users (admin) to UPDATE on all tables
CREATE POLICY "Authenticated update founders" ON public.founders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update seasons" ON public.seasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update core_team_members" ON public.core_team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update team_member_seasons" ON public.team_member_seasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update events" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update event_gallery" ON public.event_gallery FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update courses" ON public.courses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update waves" ON public.waves FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update wave_top_members" ON public.wave_top_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update wave_top_games" ON public.wave_top_games FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update gallery_categories" ON public.gallery_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update gallery_content" ON public.gallery_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update statistics" ON public.statistics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update partners" ON public.partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update youtube_videos" ON public.youtube_videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update community_games" ON public.community_games FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users (admin) to DELETE on all tables
CREATE POLICY "Authenticated delete founders" ON public.founders FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete seasons" ON public.seasons FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete core_team_members" ON public.core_team_members FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete team_member_seasons" ON public.team_member_seasons FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete events" ON public.events FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete event_gallery" ON public.event_gallery FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete courses" ON public.courses FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete waves" ON public.waves FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete wave_top_members" ON public.wave_top_members FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete wave_top_games" ON public.wave_top_games FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete gallery_categories" ON public.gallery_categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete gallery_content" ON public.gallery_content FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete statistics" ON public.statistics FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete partners" ON public.partners FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete youtube_videos" ON public.youtube_videos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated delete community_games" ON public.community_games FOR DELETE TO authenticated USING (true);

-- 4. STORAGE CONFIGURATION AND RLS POLICIES FOR 'club-media'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-media', 'club-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read club-media" ON storage.objects;
CREATE POLICY "Public read club-media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'club-media');

DROP POLICY IF EXISTS "Authenticated upload club-media" ON storage.objects;
CREATE POLICY "Authenticated upload club-media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'club-media');

DROP POLICY IF EXISTS "Authenticated update club-media" ON storage.objects;
CREATE POLICY "Authenticated update club-media" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'club-media');

DROP POLICY IF EXISTS "Authenticated delete club-media" ON storage.objects;
CREATE POLICY "Authenticated delete club-media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'club-media');

-- 5. TRIGGER FOR USER PROFILES CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. INSERT ADMIN USER PROFILE
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
