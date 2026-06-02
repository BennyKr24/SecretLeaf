-- Auto-generated rollback for scripts/migrate-wiki-to-knowledge.mjs
-- Removes all rows created by batch 'wiki_legacy_v1'.
begin;
delete from public.knowledge_articles where meta->>'batch' = 'wiki_legacy_v1';
delete from public.knowledge_sources where meta->>'batch' = 'wiki_legacy_v1';
-- Categories and tags are shared taxonomy; remove only if unreferenced.
delete from public.knowledge_tags t where not exists (select 1 from public.knowledge_article_tags at where at.tag_id = t.id);
delete from public.knowledge_categories c where not exists (select 1 from public.knowledge_articles a where a.category_id = c.id);
commit;
