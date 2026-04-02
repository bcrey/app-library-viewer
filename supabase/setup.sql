create table app_links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null,
  icon_url text not null,
  custom_icon boolean default false,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- No RLS needed — this is a single-user public app with no auth
alter table app_links disable row level security;
