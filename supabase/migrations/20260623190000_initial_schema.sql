-- Create custom types
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

-- Core Team Members
CREATE TABLE public.core_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT,
    linkedin_url TEXT,
    photo TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
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
