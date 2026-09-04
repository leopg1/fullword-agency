-- ============================================================
--  SETUP COMPLET Full Work Services — proiect Supabase nou
--  De rulat O SINGURĂ DATĂ (idempotent — repetarea nu strică).
--  Ordinea: 00-setup.sql, apoi 01-seed.sql.
--  Înlocuiește și fw_pageviews.sql (inclus mai jos).
-- ============================================================

-- ---------- 1. Allowlist de administratori + funcția de verificare ----------

create table if not exists public.fw_admins (
  email       text primary key,
  created_at  timestamptz not null default now()
);

alter table public.fw_admins enable row level security;
-- Nicio politică = nimeni nu citește/scrie prin API. Tabelul e atins DOAR de
-- funcția security definer de mai jos și din SQL Editor.

-- E admin utilizatorul logat? (emailul din JWT trebuie să fie în allowlist)
create or replace function public.fw_is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.fw_admins
    where email = lower(coalesce((select auth.jwt()->>'email'), ''))
  );
$$;

revoke execute on function public.fw_is_admin() from public, anon;
grant execute on function public.fw_is_admin() to authenticated;

-- Cine e admin: emailurile conturilor create în Authentication → Users.
insert into public.fw_admins (email) values
  ('admin@fullworkservices.com'),
  ('office@fullworkservices.com')
on conflict (email) do nothing;

-- ---------- 2. Trigger comun: updated_at ----------

create or replace function public.fw_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- 3. Joburi ----------

create table if not exists public.fw_jobs (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (char_length(slug) <= 120),
  title_ro     text not null check (char_length(title_ro) <= 250),
  title_en     text not null check (char_length(title_en) <= 250),
  city         text not null default '',
  country_code text not null default 'RO',
  salary_ro    text,
  salary_en    text,
  domain       text not null default 'construction'
               check (domain in ('construction','logistics','transport','horeca','office','medical')),
  image        text,
  remote       boolean not null default false,
  status       text not null default 'open' check (status in ('open','closed')),
  sort_order   integer not null default 0,
  content_ro   jsonb not null default '{}'::jsonb,
  content_en   jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists fw_jobs_updated_at on public.fw_jobs;
create trigger fw_jobs_updated_at
  before update on public.fw_jobs
  for each row execute function public.fw_set_updated_at();

alter table public.fw_jobs enable row level security;

-- Site-ul public citește toate joburile (le sortează el după status).
drop policy if exists fw_jobs_public_read on public.fw_jobs;
create policy fw_jobs_public_read on public.fw_jobs
  for select to anon, authenticated using (true);

-- Doar adminii scriu.
drop policy if exists fw_jobs_admin_write on public.fw_jobs;
create policy fw_jobs_admin_write on public.fw_jobs
  for all to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

-- ---------- 4. Testimoniale ----------

create table if not exists public.fw_testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role_ro    text not null default '',
  role_en    text not null default '',
  quote_ro   text not null,
  quote_en   text not null,
  published  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fw_testimonials enable row level security;

drop policy if exists fw_testimonials_public_read on public.fw_testimonials;
create policy fw_testimonials_public_read on public.fw_testimonials
  for select to anon, authenticated using (published = true);

drop policy if exists fw_testimonials_admin_all on public.fw_testimonials;
create policy fw_testimonials_admin_all on public.fw_testimonials
  for all to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

-- ---------- 5. Servicii (vizibilitate + ordine; textele stau în fw_content) ----------

create table if not exists public.fw_services (
  key        text primary key,
  published  boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.fw_services enable row level security;

drop policy if exists fw_services_public_read on public.fw_services;
create policy fw_services_public_read on public.fw_services
  for select to anon, authenticated using (true);

drop policy if exists fw_services_admin_write on public.fw_services;
create policy fw_services_admin_write on public.fw_services
  for all to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

insert into public.fw_services (key, sort_order) values
  ('recruitment', 1), ('hr', 2), ('permits', 3),
  ('market', 4), ('citizenship', 5), ('mediation', 6)
on conflict (key) do nothing;

-- ---------- 6. Texte site (suprascrieri peste messages/{ro,en}.json) ----------

create table if not exists public.fw_content (
  locale     text not null check (locale in ('ro','en')),
  key        text not null check (char_length(key) <= 300),
  value      text not null,
  updated_at timestamptz not null default now(),
  primary key (locale, key)
);

alter table public.fw_content enable row level security;

drop policy if exists fw_content_public_read on public.fw_content;
create policy fw_content_public_read on public.fw_content
  for select to anon, authenticated using (true);

drop policy if exists fw_content_admin_write on public.fw_content;
create policy fw_content_admin_write on public.fw_content
  for all to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

-- ---------- 7. Blog ----------

create table if not exists public.fw_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (char_length(slug) <= 160),
  title_ro     text not null check (char_length(title_ro) <= 250),
  title_en     text not null,
  excerpt_ro   text not null default '',
  excerpt_en   text not null default '',
  body_ro      text not null default '',
  body_en      text not null default '',
  cover_image  text,
  category     text not null default 'ghiduri',
  featured     boolean not null default false,
  published    boolean not null default false,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.fw_posts enable row level security;

-- Public: doar articolele publicate. Adminii: tot (lista din /admin/blog).
drop policy if exists fw_posts_public_read on public.fw_posts;
create policy fw_posts_public_read on public.fw_posts
  for select to anon using (published = true);

drop policy if exists fw_posts_auth_read on public.fw_posts;
create policy fw_posts_auth_read on public.fw_posts
  for select to authenticated
  using (published = true or (select public.fw_is_admin()));

drop policy if exists fw_posts_admin_write on public.fw_posts;
create policy fw_posts_admin_write on public.fw_posts
  for insert to authenticated with check ((select public.fw_is_admin()));

drop policy if exists fw_posts_admin_update on public.fw_posts;
create policy fw_posts_admin_update on public.fw_posts
  for update to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

drop policy if exists fw_posts_admin_delete on public.fw_posts;
create policy fw_posts_admin_delete on public.fw_posts
  for delete to authenticated using ((select public.fw_is_admin()));

-- ---------- 8. Aplicări la joburi (formular public + CV) ----------

create table if not exists public.fw_applications (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid references public.fw_jobs(id) on delete set null,
  name       text not null check (char_length(name) <= 200),
  phone      text not null check (char_length(phone) <= 50),
  email      text check (char_length(email) <= 320),
  message    text check (char_length(message) <= 2000),
  cv_path    text check (char_length(cv_path) <= 300),
  locale     text not null default 'ro' check (locale in ('ro','en')),
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists fw_applications_job_id_idx on public.fw_applications (job_id);
create index if not exists fw_applications_created_idx on public.fw_applications (created_at desc);

alter table public.fw_applications enable row level security;

-- Oricine poate DOAR să trimită o aplicare (nu citește nimic).
drop policy if exists fw_applications_public_insert on public.fw_applications;
create policy fw_applications_public_insert on public.fw_applications
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists fw_applications_admin_read on public.fw_applications;
create policy fw_applications_admin_read on public.fw_applications
  for select to authenticated using ((select public.fw_is_admin()));

drop policy if exists fw_applications_admin_update on public.fw_applications;
create policy fw_applications_admin_update on public.fw_applications
  for update to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

drop policy if exists fw_applications_admin_delete on public.fw_applications;
create policy fw_applications_admin_delete on public.fw_applications
  for delete to authenticated using ((select public.fw_is_admin()));

-- ---------- 9. Lead-uri (formular contact / cerere ofertă) ----------

create table if not exists public.fw_leads (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'contact' check (type in ('contact','company_offer')),
  name       text not null check (char_length(name) <= 200),
  phone      text not null check (char_length(phone) <= 50),
  email      text check (char_length(email) <= 320),
  company    text check (char_length(company) <= 200),
  message    text check (char_length(message) <= 2000),
  locale     text not null default 'ro' check (locale in ('ro','en')),
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists fw_leads_created_idx on public.fw_leads (created_at desc);

alter table public.fw_leads enable row level security;

drop policy if exists fw_leads_public_insert on public.fw_leads;
create policy fw_leads_public_insert on public.fw_leads
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists fw_leads_admin_read on public.fw_leads;
create policy fw_leads_admin_read on public.fw_leads
  for select to authenticated using ((select public.fw_is_admin()));

drop policy if exists fw_leads_admin_update on public.fw_leads;
create policy fw_leads_admin_update on public.fw_leads
  for update to authenticated
  using ((select public.fw_is_admin()))
  with check ((select public.fw_is_admin()));

drop policy if exists fw_leads_admin_delete on public.fw_leads;
create policy fw_leads_admin_delete on public.fw_leads
  for delete to authenticated using ((select public.fw_is_admin()));

-- ---------- 10. Statistici site (vizite anonime, fără cookie-uri) ----------
--  Confidențialitate: NU stocăm adrese IP și NU punem cookie-uri.
--  `visitor` e un cod anonim recalculat zilnic — nu identifică persoane.

create table if not exists public.fw_pageviews (
  id          bigint generated always as identity primary key,
  path        text not null,
  source      text not null default 'direct',
  visitor     text not null,
  day         date not null default (now() at time zone 'utc')::date,
  created_at  timestamptz not null default now()
);

create index if not exists fw_pageviews_day_idx     on public.fw_pageviews (day);
create index if not exists fw_pageviews_path_idx    on public.fw_pageviews (path);
create index if not exists fw_pageviews_visitor_idx on public.fw_pageviews (day, visitor);

alter table public.fw_pageviews enable row level security;

drop policy if exists fw_pageviews_insert on public.fw_pageviews;
create policy fw_pageviews_insert on public.fw_pageviews
  for insert to anon, authenticated
  with check (true);

drop policy if exists fw_pageviews_admin_read on public.fw_pageviews;
create policy fw_pageviews_admin_read on public.fw_pageviews
  for select to authenticated
  using ((select public.fw_is_admin()));

-- Curățenie: păstrăm vizitele brute 1 an; apelată automat de site.
create or replace function public.fw_pageviews_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.fw_pageviews where day < (now() at time zone 'utc')::date - 365;
$$;

grant execute on function public.fw_pageviews_cleanup() to anon, authenticated;

-- ---------- 11. Storage: bucket PRIVAT pentru CV-uri ----------

insert into storage.buckets (id, name, public)
values ('fw-cvs', 'fw-cvs', false)
on conflict (id) do nothing;

-- Oricine poate URCA un CV (aplicare/generator); nimeni nu citește public.
drop policy if exists "fw-cvs public upload" on storage.objects;
create policy "fw-cvs public upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'fw-cvs');

-- Doar adminii citesc (link-urile semnate din /admin au nevoie de select).
drop policy if exists "fw-cvs admin read" on storage.objects;
create policy "fw-cvs admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'fw-cvs' and (select public.fw_is_admin()));

drop policy if exists "fw-cvs admin delete" on storage.objects;
create policy "fw-cvs admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fw-cvs' and (select public.fw_is_admin()));

-- ---------- 12. Drepturi API (siguranță în plus la proiectele noi) ----------

grant usage on schema public to anon, authenticated;
grant select on public.fw_jobs, public.fw_testimonials, public.fw_services,
             public.fw_content, public.fw_posts to anon, authenticated;
grant insert on public.fw_applications, public.fw_leads, public.fw_pageviews to anon, authenticated;
grant select, insert, update, delete on public.fw_jobs, public.fw_testimonials,
             public.fw_services, public.fw_content, public.fw_posts,
             public.fw_applications, public.fw_leads to authenticated;
grant select on public.fw_pageviews to authenticated;
