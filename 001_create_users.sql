-- Migration: create users table for Freshly
-- Run this in Supabase SQL editor or via migration tool

CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                TEXT NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  full_name            TEXT,
  username             TEXT UNIQUE
                         CHECK (char_length(username) BETWEEN 3 AND 30
                                AND username ~ '^[a-zA-Z0-9_.\\-]+$'),
  bio                  TEXT CHECK (char_length(bio) <= 300),
  avatar_url           TEXT,
  dietary_preferences  TEXT[] DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security: each user can only read/write their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
