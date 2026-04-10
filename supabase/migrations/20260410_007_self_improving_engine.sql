-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Self-Improving Engine Tables
-- ────────────────────────────────────────────────────────────────────────────
-- Adds:
-- 1. study_feedback — tracks user interactions with studies
-- 2. scoring_weights_history — audit trail for adaptive weight changes
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. Study Feedback ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS study_feedback (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    study_id    uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    event_type  text NOT NULL CHECK (event_type IN (
        'view', 'click', 'review_good', 'review_bad', 'review_skip', 'search_hit'
    )),
    user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata    jsonb DEFAULT '{}'::jsonb,
    created_at  timestamptz DEFAULT now() NOT NULL
);

-- Indexes for fast aggregation
CREATE INDEX IF NOT EXISTS idx_study_feedback_study_id
    ON study_feedback (study_id);
CREATE INDEX IF NOT EXISTS idx_study_feedback_event_type
    ON study_feedback (event_type);
CREATE INDEX IF NOT EXISTS idx_study_feedback_created_at
    ON study_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_feedback_study_event
    ON study_feedback (study_id, event_type);

-- RLS: Service role can read/write all. Authenticated users can insert own events.
ALTER TABLE study_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON study_feedback
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_own" ON study_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_can_read_own" ON study_feedback
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- ── 2. Scoring Weights History ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scoring_weights_history (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    weights          jsonb NOT NULL,
    reason           text NOT NULL,
    based_on_studies integer NOT NULL DEFAULT 0,
    computed_at      timestamptz NOT NULL,
    created_at       timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scoring_weights_computed_at
    ON scoring_weights_history (computed_at DESC);

-- RLS: Only service role can access weight history
ALTER TABLE scoring_weights_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON scoring_weights_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Done
-- ────────────────────────────────────────────────────────────────────────────
