-- Project Kisan - Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor

-- 1. Diagnosis table (crop disease diagnosis records)
CREATE TABLE IF NOT EXISTS diagnosis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Voice interactions table (voice query logs)
CREATE TABLE IF NOT EXISTS voice_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT,
  response TEXT,
  language TEXT,
  is_mock BOOLEAN DEFAULT false,
  location TEXT,
  season TEXT,
  crop TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - allow all for now, tighten later
ALTER TABLE diagnosis ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;

-- Allow anon role full access (for backend server)
CREATE POLICY "Allow all for anon" ON diagnosis FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON voice_interactions FOR ALL USING (true);
