-- P1 hardening: make source_fingerprint uniqueness deterministic for upsert

with ranked as (
  select id,
         row_number() over (partition by source_fingerprint order by created_at desc nulls last, id desc) as rn
  from public.studies
  where source_fingerprint is not null
)
delete from public.studies s
using ranked r
where s.id = r.id
  and r.rn > 1;

drop index if exists public.studies_source_fingerprint_uidx;

create unique index studies_source_fingerprint_uidx
  on public.studies (source_fingerprint);
