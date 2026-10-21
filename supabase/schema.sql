-- PlaceTrack schema
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- It is safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).

-- ---------------------------------------------------------------
-- Table 1: applications
-- ---------------------------------------------------------------
create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                     references auth.users(id) on delete cascade,
  company_name     text not null check (char_length(trim(company_name)) > 0),
  job_role         text not null check (char_length(trim(job_role)) > 0),
  job_description  text,
  application_date date not null default current_date,
  deadline         date,
  interview_date   date,               -- optional: shown on the Deadlines page
  job_url          text,
  status           text not null default 'Applied'
                     check (status in ('Applied', 'Assessment', 'Interview', 'Offer', 'Rejected')),
  notes            text,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Table 2: preparation_tasks
-- ---------------------------------------------------------------
create table if not exists public.preparation_tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users(id) on delete cascade,
  title        text not null check (char_length(trim(title)) > 0),
  subject      text not null check (char_length(trim(subject)) > 0),
  due_date     date,
  is_completed boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Indexes (queries filter by user, then sort/filter by these columns)
-- ---------------------------------------------------------------
create index if not exists applications_user_status_idx
  on public.applications (user_id, status);
create index if not exists applications_user_deadline_idx
  on public.applications (user_id, deadline);
create index if not exists applications_user_app_date_idx
  on public.applications (user_id, application_date desc);
create index if not exists prep_tasks_user_completed_idx
  on public.preparation_tasks (user_id, is_completed, due_date);

-- ---------------------------------------------------------------
-- Row Level Security: each user can only touch their own rows
-- ---------------------------------------------------------------
alter table public.applications      enable row level security;
alter table public.preparation_tasks enable row level security;

drop policy if exists "applications_select_own" on public.applications;
drop policy if exists "applications_insert_own" on public.applications;
drop policy if exists "applications_update_own" on public.applications;
drop policy if exists "applications_delete_own" on public.applications;

create policy "applications_select_own" on public.applications
  for select to authenticated using (auth.uid() = user_id);
create policy "applications_insert_own" on public.applications
  for insert to authenticated with check (auth.uid() = user_id);
create policy "applications_update_own" on public.applications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications_delete_own" on public.applications
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "prep_tasks_select_own" on public.preparation_tasks;
drop policy if exists "prep_tasks_insert_own" on public.preparation_tasks;
drop policy if exists "prep_tasks_update_own" on public.preparation_tasks;
drop policy if exists "prep_tasks_delete_own" on public.preparation_tasks;

create policy "prep_tasks_select_own" on public.preparation_tasks
  for select to authenticated using (auth.uid() = user_id);
create policy "prep_tasks_insert_own" on public.preparation_tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "prep_tasks_update_own" on public.preparation_tasks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prep_tasks_delete_own" on public.preparation_tasks
  for delete to authenticated using (auth.uid() = user_id);
