-- CHAUKAS telemetry. Anonymous by design: no name, phone, email, IP, PIN/OTP digits. Ever.
create table if not exists drill_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,                 -- random UUID made in the browser, never tied to identity
  scenario_id text not null,
  lang text not null check (lang in ('en','hi')),
  outcome text not null check (outcome in ('scammed','escaped','escaped_late')),
  loss_inr int not null default 0,
  knew_rule boolean,                        -- pre-check answer correct? NULL = skipped
  risky_actions int not null default 0,
  flags_walked_past int not null default 0,
  flags_total int not null default 0,
  duration_ms int not null,
  hesitation_ms int,                        -- longest pause on a PIN/OTP pad before typing
  attempt int not null default 1,           -- 1 = first try, 2+ = re-drill (measures learning)
  age_band text check (age_band in ('<18','18-30','31-50','51+')),
  source text                               -- 'direct' | 'family_link'
);
alter table drill_runs enable row level security;
-- No policies on purpose: the browser can neither read nor write this table.
-- All writes go through POST /api/run (server, service-role key, zod-validated, rate-limited).

create or replace view insights as
select scenario_id,
  count(*)                                                                    as runs,
  count(*) filter (where attempt = 1)                                         as first_runs,
  count(*) filter (where attempt = 1 and outcome = 'scammed')                 as first_scammed,
  count(*) filter (where attempt = 1 and knew_rule)                           as knew_rule_first,
  count(*) filter (where attempt = 1 and knew_rule and outcome = 'scammed')   as knew_but_fell,   -- the headline number
  count(*) filter (where attempt > 1)                                         as redrills,
  count(*) filter (where attempt > 1 and outcome = 'scammed')                 as redrill_scammed,
  round(avg(duration_ms))                                                     as avg_duration_ms
from drill_runs group by scenario_id;
-- Knowledge-Behaviour Gap = sum(knew_but_fell) / sum(knew_rule_first). Always display it with n = sum(knew_rule_first).
