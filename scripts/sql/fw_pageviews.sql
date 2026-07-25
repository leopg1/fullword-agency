-- ============================================================
--  Statistici site — tabelul de vizite
--  De rulat o singură dată în Supabase → SQL Editor → Run.
-- ============================================================
--  Confidențialitate: NU stocăm adrese IP și NU punem cookie-uri.
--  Coloana `visitor` e un cod anonim, recalculat în fiecare zi din
--  IP + browser + o sare zilnică; nu poate fi folosit ca să identifici
--  o persoană și nu leagă vizitele de la o zi la alta. De aceea site-ul
--  NU are nevoie de bandă de consimțământ pentru cookie-uri.
-- ============================================================

create table if not exists public.fw_pageviews (
  id          bigint generated always as identity primary key,
  path        text not null,                    -- pagina vizitată, ex. /joburi/sudor-asamblator
  source      text not null default 'direct',   -- de unde a venit: facebook, google, whatsapp...
  visitor     text not null,                    -- cod anonim, se schimbă zilnic
  day         date not null default (now() at time zone 'utc')::date,
  created_at  timestamptz not null default now()
);

create index if not exists fw_pageviews_day_idx     on public.fw_pageviews (day);
create index if not exists fw_pageviews_path_idx    on public.fw_pageviews (path);
create index if not exists fw_pageviews_visitor_idx on public.fw_pageviews (day, visitor);

alter table public.fw_pageviews enable row level security;

-- Site-ul public poate DOAR să scrie o vizită (nu poate citi nimic).
drop policy if exists fw_pageviews_insert on public.fw_pageviews;
create policy fw_pageviews_insert on public.fw_pageviews
  for insert to anon, authenticated
  with check (true);

-- Doar administratorii din allowlist pot citi statisticile.
drop policy if exists fw_pageviews_admin_read on public.fw_pageviews;
create policy fw_pageviews_admin_read on public.fw_pageviews
  for select to authenticated
  using (public.fw_is_admin());

-- Curățenie: păstrăm vizitele brute 1 an. Funcția e apelată rar și automat
-- de site (nu trebuie programat nimic), ca baza să nu crească la nesfârșit.
create or replace function public.fw_pageviews_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.fw_pageviews where day < (now() at time zone 'utc')::date - 365;
$$;

grant execute on function public.fw_pageviews_cleanup() to anon, authenticated;
