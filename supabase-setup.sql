create table if not exists restaurantes (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
