create table app_links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null,
  icon_url text not null,
  custom_icon boolean default false,
  description text,
  what_learned text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Enable Row-Level Security
alter table app_links enable row level security;

-- Allow anyone to read (public homepage)
create policy "Public read access"
  on app_links for select
  using (true);

-- Only the service_role key (used by server API routes) can write.
-- No insert/update/delete policies for anon = writes are blocked for anon.

-- Migration for existing installations (safe to run repeatedly)
alter table app_links add column if not exists description text;
alter table app_links add column if not exists what_learned text;
