-- SocialSync 2.0 Database Schema
-- Shared Supabase Backend Migration (Safe & Non-Destructive)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Content Manager',
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Social Accounts Table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  account_name TEXT,
  account_id TEXT,
  -- Real OAuth fields (added in v2)
  platform_user_id TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  -- Tokens (server-side only — never returned to frontend via API)
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  connected BOOLEAN DEFAULT true,
  followers_count INT DEFAULT 0,
  -- Publishing capability flag
  can_publish BOOLEAN DEFAULT true,
  publish_note TEXT, -- e.g. "Personal account — publishing unavailable"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can view own social accounts'
  ) THEN
    CREATE POLICY "Users can view own social accounts" ON public.social_accounts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can insert own social accounts'
  ) THEN
    CREATE POLICY "Users can insert own social accounts" ON public.social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can update own social accounts'
  ) THEN
    CREATE POLICY "Users can update own social accounts" ON public.social_accounts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can delete own social accounts'
  ) THEN
    CREATE POLICY "Users can delete own social accounts" ON public.social_accounts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Index to speed up per-user platform lookups
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);

-- Extend existing table with new real OAuth columns (safe — IF NOT EXISTS equivalent via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='platform_user_id') THEN
    ALTER TABLE public.social_accounts ADD COLUMN platform_user_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='display_name') THEN
    ALTER TABLE public.social_accounts ADD COLUMN display_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='profile_image_url') THEN
    ALTER TABLE public.social_accounts ADD COLUMN profile_image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='can_publish') THEN
    ALTER TABLE public.social_accounts ADD COLUMN can_publish BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='publish_note') THEN
    ALTER TABLE public.social_accounts ADD COLUMN publish_note TEXT;
  END IF;
END $$;

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "reach": 0}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can view own posts'
  ) THEN
    CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can insert own posts'
  ) THEN
    CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Media Assets Table (NEW — real Supabase Storage uploads)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,     -- e.g. "user_id/uuid.jpg"
  public_url TEXT NOT NULL,       -- Supabase Storage public/signed URL
  mime_type TEXT NOT NULL,        -- e.g. "image/jpeg"
  file_size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Users can view own media'
  ) THEN
    CREATE POLICY "Users can view own media" ON public.media_assets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Users can insert own media'
  ) THEN
    CREATE POLICY "Users can insert own media" ON public.media_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Users can delete own media'
  ) THEN
    CREATE POLICY "Users can delete own media" ON public.media_assets FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_media_assets_user ON public.media_assets(user_id);

-- 5. Supabase Storage Bucket for media uploads
-- Run this in your Supabase Dashboard → SQL Editor:
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'socialsync-media',
--   'socialsync-media',
--   false,
--   10485760,  -- 10 MB max file size
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- )
-- ON CONFLICT (id) DO NOTHING;
--
-- Then add these Storage RLS policies via Dashboard → Storage → Policies:
--
-- Policy 1 (INSERT): authenticated users can upload to their own folder
--   USING: (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy 2 (SELECT): users can view their own files
--   USING: (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy 3 (DELETE): users can delete their own files
--   USING: (storage.foldername(name))[1] = auth.uid()::text

-- Trigger to automatically create profile record when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Content Manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Social Accounts Table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  account_name TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  connected BOOLEAN DEFAULT true,
  followers_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can view own social accounts'
  ) THEN
    CREATE POLICY "Users can view own social accounts" ON public.social_accounts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can insert own social accounts'
  ) THEN
    CREATE POLICY "Users can insert own social accounts" ON public.social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can update own social accounts'
  ) THEN
    CREATE POLICY "Users can update own social accounts" ON public.social_accounts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'Users can delete own social accounts'
  ) THEN
    CREATE POLICY "Users can delete own social accounts" ON public.social_accounts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "reach": 0}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can view own posts'
  ) THEN
    CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can insert own posts'
  ) THEN
    CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to automatically create profile record when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
