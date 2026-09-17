-- ─────────────────────────────────────────────────────────────
-- Answer Card — Supabase schema.
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: objects use IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────

-- 1. Questions ──────────────────────────────────────────────
-- One row per cast (time or coin). The hexagram + interpretation
-- are stored as JSONB so the Python backend owns the shape and
-- the frontend contract is never broken by a column rename.
CREATE TABLE IF NOT EXISTS public.questions (
    id            text PRIMARY KEY,
    user_id       text NOT NULL DEFAULT 'local',
    question_text text NOT NULL,
    question_type text NOT NULL DEFAULT 'other',
    hexagram      jsonb NOT NULL,
    interpretation jsonb NOT NULL,
    is_unlocked   boolean NOT NULL DEFAULT false,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_user       ON public.questions (user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions (user_id, created_at DESC);


-- 2. Follow-ups ─────────────────────────────────────────────
-- Each follow-up is tied to one question and preserves both sides.
CREATE TABLE IF NOT EXISTS public.followups (
    id            text PRIMARY KEY,
    question_id   text NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_message  text NOT NULL,
    ai_response   text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followups_question ON public.followups (question_id, created_at);


-- 3. Users (entitlement ledger) ─────────────────────────────
-- The MVP runs without auth; every request is the "local" user.
-- plan: 'free' | 'monthly'
CREATE TABLE IF NOT EXISTS public.users (
    id                 text PRIMARY KEY DEFAULT 'local',
    plan               text NOT NULL DEFAULT 'free',
    followup_credits   integer NOT NULL DEFAULT 0,
    daily_date         text NOT NULL DEFAULT '',
    daily_used         integer NOT NULL DEFAULT 0,
    time_cast_stamp    text,
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Row for the local user, so the first request doesn't need an upsert.
INSERT INTO public.users (id) VALUES ('local')
    ON CONFLICT (id) DO NOTHING;


-- 4. Row Level Security ─────────────────────────────────────
-- All access goes through the service-role key from the backend,
-- so RLS denies anon/authenticated by default and we add a
-- permissive policy only for the service role (which bypasses RLS
-- anyway). These policies are a safety net for direct dashboard use.

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; no policy needed for it.
-- Drop any stale policies from earlier experiments.
DO $$
DECLARE r record;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.questions', r.policyname);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.followups', r.policyname);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;
