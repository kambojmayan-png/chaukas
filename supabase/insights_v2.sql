-- Run once in the Supabase SQL Editor. Adds a richer, still aggregate-only view for /insights.
create or replace view insights_v2 as
select
  scenario_id,
  count(*) filter (where attempt = 1)                                                   as first_runs,
  count(*) filter (where attempt = 1 and outcome = 'scammed')                           as first_scammed,
  count(*) filter (where attempt = 1 and outcome = 'escaped_late')                      as first_escaped_late,
  count(*) filter (where attempt = 1 and outcome = 'escaped')                           as first_escaped,
  count(*) filter (where attempt = 1 and knew_rule)                                     as knew_rule_first,
  count(*) filter (where attempt = 1 and knew_rule and outcome = 'scammed')             as knew_but_fell,
  count(*) filter (where attempt > 1)                                                   as redrills,
  count(*) filter (where attempt > 1 and outcome = 'scammed')                           as redrill_scammed,
  round(avg(hesitation_ms) filter (where attempt = 1 and outcome = 'scammed'))          as avg_hesitation_ms_scammed,
  round(avg(flags_walked_past::numeric) filter (where attempt = 1), 1)                  as avg_flags_walked_past,
  max(flags_total)                                                                      as flags_total,
  round(avg(duration_ms) filter (where attempt = 1))                                    as avg_duration_ms,
  count(*) filter (where attempt = 1 and source like 'saral%')                          as first_runs_simple_ui,
  count(*) filter (where attempt = 1 and source like 'saral%' and outcome = 'scammed')  as first_scammed_simple_ui,
  count(*) filter (where attempt = 1 and lang = 'hi')                                   as first_runs_hindi,
  count(*) filter (where attempt = 1 and source like '%family%')                        as first_runs_family_link,
  count(*) filter (where created_at > now() - interval '24 hours')                      as runs_last_24h
from drill_runs
group by scenario_id;

revoke all on table insights_v2 from anon, authenticated;
grant select on table insights_v2 to service_role;
