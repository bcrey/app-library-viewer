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

-- No RLS needed — this is a single-user public app with no auth
alter table app_links disable row level security;

-- Migration for existing installations (safe to run repeatedly)
alter table app_links add column if not exists description text;
alter table app_links add column if not exists what_learned text;
