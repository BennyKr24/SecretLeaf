-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Engine Configuration Store
-- ────────────────────────────────────────────────────────────────────────────
-- Dynamic key-value config for the study engine algorithm.
-- Allows admins to override hardcoded defaults (keywords, clusters,
-- exclusion rules, scoring params, sources) without code changes.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS engine_config (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key   text UNIQUE NOT NULL,
    config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at   timestamptz DEFAULT now() NOT NULL,
    updated_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_engine_config_key
    ON engine_config (config_key);

-- RLS: Only service role can read/write
ALTER TABLE engine_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON engine_config
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── Seed default config sections ────────────────────────────────────────────

-- Required keywords: studies must contain at least one of these to pass
INSERT INTO engine_config (config_key, config_value) VALUES
('required_keywords', '{
  "keywords": [
    {"term": "cannabis", "enabled": true},
    {"term": "cannabinoid", "enabled": true},
    {"term": "thc", "enabled": true},
    {"term": "cbd", "enabled": true},
    {"term": "terpene", "enabled": true},
    {"term": "endocannabinoid", "enabled": true},
    {"term": "marijuana", "enabled": true}
  ]
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Preferred sources: publishers that get a quality boost
INSERT INTO engine_config (config_key, config_value) VALUES
('preferred_sources', '{
  "sources": [
    {"name": "Nature", "quality": "high", "enabled": true},
    {"name": "Lancet", "quality": "high", "enabled": true},
    {"name": "JAMA", "quality": "high", "enabled": true},
    {"name": "NEJM", "quality": "high", "enabled": true},
    {"name": "Cochrane", "quality": "high", "enabled": true},
    {"name": "Frontiers", "quality": "high", "enabled": true},
    {"name": "Springer", "quality": "high", "enabled": true},
    {"name": "Elsevier", "quality": "high", "enabled": true},
    {"name": "Wiley", "quality": "high", "enabled": true},
    {"name": "Oxford", "quality": "high", "enabled": true},
    {"name": "MDPI", "quality": "mid", "enabled": true}
  ]
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Blocked sources: publishers/patterns to reject
INSERT INTO engine_config (config_key, config_value) VALUES
('blocked_sources', '{
  "sources": []
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Custom exclusion rules (admin-defined, on top of hardcoded ones)
INSERT INTO engine_config (config_key, config_value) VALUES
('custom_exclusions', '{
  "rules": []
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Topic cluster overrides (custom queries & patterns per cluster)
INSERT INTO engine_config (config_key, config_value) VALUES
('topic_clusters', '{
  "overrides": {},
  "customClusters": []
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Scoring parameters
INSERT INTO engine_config (config_key, config_value) VALUES
('scoring_params', '{
  "minAcceptScore": 34,
  "crossrefRowsPerQuery": 60,
  "fuzzyThreshold": 0.85,
  "weights": {
    "topicFit": 0.38,
    "evidenceLevel": 0.24,
    "publisherQuality": 0.18,
    "freshness": 0.08,
    "editorialUtility": 0.12
  }
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Cannabis anchor terms
INSERT INTO engine_config (config_key, config_value) VALUES
('cannabis_anchor', '{
  "terms": [
    {"term": "medical cannabis", "enabled": true},
    {"term": "cannabis", "enabled": true},
    {"term": "cannabinoid", "enabled": true},
    {"term": "endocannabinoid", "enabled": true},
    {"term": "thc", "enabled": true, "wordBoundary": true},
    {"term": "thca", "enabled": true, "wordBoundary": true},
    {"term": "cbd", "enabled": true, "wordBoundary": true},
    {"term": "cbda", "enabled": true, "wordBoundary": true},
    {"term": "cbn", "enabled": true, "wordBoundary": true},
    {"term": "cbg", "enabled": true, "wordBoundary": true},
    {"term": "terpene", "enabled": true},
    {"term": "terpenoid", "enabled": true},
    {"term": "marijuana", "enabled": true},
    {"term": "hashish", "enabled": true}
  ]
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- Done
-- ────────────────────────────────────────────────────────────────────────────
