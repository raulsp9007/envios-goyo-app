-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Order status enum
create type order_status as enum (
  'pending_payment',
  'waiting',
  'processing',
  'delivered',
  'completed'
);

-- Products table
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default '',
  price_usd numeric(10,2) not null check (price_usd >= 0),
  cost_cup numeric(10,2) not null check (cost_cup >= 0),
  description text not null default '',
  image_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Exchange rate (single row, id always = 1)
create table exchange_rate (
  id integer primary key default 1,
  rate numeric(10,2) not null check (rate > 0),
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);
insert into exchange_rate (id, rate, updated_by) values (1, 600, 'system');

-- Orders table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number serial,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_note text not null default '',
  status order_status not null default 'pending_payment',
  total_usd numeric(10,2) not null,
  exchange_rate_snapshot numeric(10,2) not null,
  payment_instructions text not null default '',
  created_at timestamptz not null default now()
);

-- Order items (snapshots price and cost at order time)
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_usd numeric(10,2) not null,
  cost_cup numeric(10,2) not null
);

-- Admin settings (key-value)
create table settings (
  key text primary key,
  value text not null
);
insert into settings (key, value) values
  ('payment_instructions', 'Realiza el pago via Zelle al número +1 (555) 000-0000 indicando tu número de orden.'),
  ('business_name', 'Envios Goyo'),
  ('business_tagline', 'Tu mercado cubano desde el exterior');

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table exchange_rate enable row level security;
alter table settings enable row level security;

-- Allow anon to read active products (cost_cup is protected at app layer, not listed in public select)
create policy "Public read active products"
  on products for select
  to anon
  using (active = true);

-- Allow anon to insert orders (checkout)
create policy "Public insert orders"
  on orders for insert
  to anon
  with check (true);

-- Allow anon to insert order_items
create policy "Public insert order_items"
  on order_items for insert
  to anon
  with check (true);

-- Allow anon to read orders by id (for tracking page)
create policy "Public read order by id"
  on orders for select
  to anon
  using (true);

-- Allow anon to read order items (for tracking page)
create policy "Public read order_items"
  on order_items for select
  to anon
  using (true);

-- Allow anon to read exchange rate (shown in checkout)
create policy "Public read exchange rate"
  on exchange_rate for select
  to anon
  using (true);

-- Allow anon to read safe settings only
create policy "Public read settings"
  on settings for select
  to anon
  using (key in ('payment_instructions', 'business_name', 'business_tagline'));

-- Seed sample products
insert into products (name, category, price_usd, cost_cup, description, active) values
  ('Arroz (1 lb)', 'Granos', 1.00, 350, 'Arroz de primera calidad', true),
  ('Aceite (1 lt)', 'Despensa', 4.10, 1500, 'Aceite vegetal importado', true),
  ('Pollo entero', 'Carnes', 12.92, 5500, 'Pollo fresco entero ~2kg', true);
