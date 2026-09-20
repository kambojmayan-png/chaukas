-- Run once in the Supabase SQL Editor (after schema.sql and insights_v2.sql).

-- 1) Idempotent telemetry: a retried send can never create a duplicate row.
alter table drill_runs add column if not exists run_id uuid;
create unique index if not exists drill_runs_run_id_key on drill_runs (run_id) where run_id is not null;

-- 2) Durable rate limiting that survives serverless cold starts.
--    The bucket is sha256(secret salt | ip | 10-minute window), computed on the server.
--    It cannot be reversed to an IP address, lives at most ten minutes,
--    sits in its own table and is never linked to practice data.
create table if not exists rate_hits (
  bucket      text primary key,
  hits        int  not null default 1,
  expires_at  timestamptz not null
);
alter table rate_hits enable row level security;
revoke all on table rate_hits from anon, authenticated;
grant  all on table rate_hits to service_role;

create or replace function hit_rate_limit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_hits int;
begin
  delete from rate_hits where expires_at < now();
  insert into rate_hits (bucket, hits, expires_at)
       values (p_bucket, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (bucket) do update set hits = rate_hits.hits + 1
  returning hits into v_hits;
  return v_hits <= p_limit;
end $$;

revoke all on function hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function hit_rate_limit(text, int, int) to service_role;
