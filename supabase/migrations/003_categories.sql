create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  emoji text not null default '📦',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Public read categories"
  on categories for select to anon using (true);

-- Seed with existing categories
insert into categories (name, emoji, position) values
  ('Cárnicos',   '🥩', 1),
  ('Embutidos',  '🌭', 2),
  ('Granos',     '🌾', 3),
  ('Agro',       '🌿', 4),
  ('Bebidas',    '🥤', 5),
  ('Lácteos',    '🥛', 6),
  ('Hogar',      '🏠', 7),
  ('Pastas',     '🍝', 8),
  ('Confituras', '🍬', 9),
  ('Café',       '☕', 10),
  ('Temporada',  '🍎', 11),
  ('Otros',      '📦', 12);
