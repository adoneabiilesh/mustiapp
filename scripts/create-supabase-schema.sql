-- Tables
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  avatar text
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  image_url text,
  description text,
  calories int,
  protein int,
  rating numeric,
  type text,
  categories text[]
);

-- Orders and delivery tables
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.users(id) on delete cascade,
  restaurant_id uuid, -- for multi-restaurant support
  status text not null default 'draft', -- draft, confirmed, paid, preparing, out_for_delivery, delivered, cancelled
  total numeric not null,
  payment_intent_id text,
  delivery_address jsonb,
  special_instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  quantity int not null default 1,
  unit_price numeric not null,
  customizations jsonb default '[]'::jsonb
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  courier_id uuid references public.users(id),
  status text not null default 'assigned', -- assigned, picked_up, in_transit, delivered
  pickup_eta timestamptz,
  dropoff_eta timestamptz,
  actual_pickup_at timestamptz,
  actual_delivery_at timestamptz,
  route jsonb, -- for storing route data
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.courier_locations (
  id uuid primary key default gen_random_uuid(),
  courier_id uuid references public.users(id) on delete cascade,
  location geography(point, 4326) not null,
  accuracy numeric,
  heading numeric,
  speed numeric,
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_deliveries_order_id on public.deliveries(order_id);
create index if not exists idx_deliveries_courier_id on public.deliveries(courier_id);
create index if not exists idx_courier_locations_courier_id on public.courier_locations(courier_id);
create index if not exists idx_courier_locations_updated_at on public.courier_locations(updated_at);

-- Storage bucket (create manually via dashboard or CLI)
-- Bucket name: images (public)

-- Row Level Security
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;
alter table public.courier_locations enable row level security;

-- Policies
create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can insert their profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Public read categories" on public.categories
  for select using (true);

-- Admin policies for categories
create policy "Authenticated can insert categories" on public.categories
  for insert with check (auth.role() = 'authenticated' OR auth.role() = 'service_role');

create policy "Authenticated can update categories" on public.categories
  for update using (auth.role() = 'authenticated' OR auth.role() = 'service_role');

create policy "Authenticated can delete categories" on public.categories
  for delete using (auth.role() = 'authenticated' OR auth.role() = 'service_role');

create policy "Public read menu items" on public.menu_items
  for select using (true);

-- Admin policies for menu items (products)
create policy "Authenticated can insert menu items" on public.menu_items
  for insert with check (auth.role() = 'authenticated' OR auth.role() = 'service_role');

create policy "Authenticated can update menu items" on public.menu_items
  for update using (auth.role() = 'authenticated' OR auth.role() = 'service_role');

create policy "Authenticated can delete menu items" on public.menu_items
  for delete using (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Order policies
create policy "Users can read own orders" on public.orders
  for select using (auth.uid() = customer_id OR auth.role() = 'authenticated');

create policy "Users can insert own orders" on public.orders
  for insert with check (auth.uid() = customer_id OR auth.role() = 'service_role');

create policy "Users can update own orders" on public.orders
  for update using (auth.uid() = customer_id OR auth.role() = 'authenticated');

create policy "Couriers can read assigned deliveries" on public.orders
  for select using (exists (
    select 1 from public.deliveries 
    where deliveries.order_id = orders.id 
    and deliveries.courier_id = auth.uid()
  ));

-- Order items policies
create policy "Users can read order items for own orders" on public.order_items
  for select using (exists (
    select 1 from public.orders 
    where orders.id = order_items.order_id 
    and orders.customer_id = auth.uid()
  ));

create policy "Users can insert order items for own orders" on public.order_items
  for insert with check (exists (
    select 1 from public.orders 
    where orders.id = order_items.order_id 
    and orders.customer_id = auth.uid()
  ));

-- Delivery policies
create policy "Users can read deliveries for own orders" on public.deliveries
  for select using (exists (
    select 1 from public.orders 
    where orders.id = deliveries.order_id 
    and orders.customer_id = auth.uid()
  ));

create policy "Couriers can read own deliveries" on public.deliveries
  for select using (auth.uid() = courier_id);

create policy "Couriers can update own deliveries" on public.deliveries
  for update using (auth.uid() = courier_id);

-- Courier location policies
create policy "Couriers can manage own location" on public.courier_locations
  for all using (auth.uid() = courier_id);

create policy "Users can read courier locations for their deliveries" on public.courier_locations
  for select using (exists (
    select 1 from public.deliveries d
    join public.orders o on d.order_id = o.id
    where d.courier_id = courier_locations.courier_id
    and o.customer_id = auth.uid()
  ));

-- Functions for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_orders_updated_at before update on public.orders
  for each row execute function update_updated_at_column();

create trigger update_deliveries_updated_at before update on public.deliveries
  for each row execute function update_updated_at_column();



