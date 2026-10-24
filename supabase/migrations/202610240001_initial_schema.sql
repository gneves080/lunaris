create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  phone text not null default '',
  email text not null default '',
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'America/Sao_Paulo',
  first_day_of_week smallint not null default 1 check (first_day_of_week between 0 and 6),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.business_id
  from public.profiles as p
  where p.user_id = (select auth.uid())
  limit 1
$$;

revoke all on function public.current_business_id() from public;
grant execute on function public.current_business_id() to authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  category text not null default 'Outros',
  price numeric(12, 2) not null default 0 check (price >= 0),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  unit text not null default 'un' check (unit in ('un', 'g', 'kg', 'ml', 'l')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  phone text not null default '',
  email text,
  notes text,
  total_purchased numeric(12, 2) not null default 0 check (total_purchased >= 0),
  last_purchase_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  number text not null,
  customer_id uuid,
  customer_name text not null,
  created_at timestamptz not null default now(),
  delivery_date timestamptz not null,
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  payment_method text not null default 'Pix',
  payment_status text not null default 'Pendente'
    check (payment_status in ('Pendente', 'Parcialmente pago', 'Pago', 'Reembolsado')),
  status text not null default 'Pendente de confirmação'
    check (status in ('Pendente de confirmação', 'Confirmado', 'Em produção', 'Pronto', 'Entregue', 'Cancelado')),
  notes text,
  unique (business_id, id),
  unique (business_id, number),
  constraint orders_customer_same_business_fk
    foreign key (business_id, customer_id)
    references public.customers (business_id, id)
    on delete set null (customer_id)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_id uuid not null,
  product_id uuid,
  product_name text not null,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null check (total >= 0),
  constraint order_items_order_same_business_fk
    foreign key (business_id, order_id)
    references public.orders (business_id, id)
    on delete cascade,
  constraint order_items_product_same_business_fk
    foreign key (business_id, product_id)
    references public.products (business_id, id)
    on delete set null (product_id)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  category text not null default 'Ingredientes',
  unit text not null default 'kg' check (unit in ('g', 'kg', 'ml', 'l', 'un')),
  quantity numeric(12, 3) not null default 0 check (quantity >= 0),
  minimum_stock numeric(12, 3) not null default 0 check (minimum_stock >= 0),
  unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
  supplier text,
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  inventory_item_id uuid not null,
  type text not null check (type in ('entry', 'exit', 'adjustment')),
  quantity numeric(12, 3) not null check (quantity > 0),
  happened_at timestamptz not null default now(),
  reason text not null default '',
  user_id uuid references auth.users (id) on delete set null,
  constraint inventory_movements_item_same_business_fk
    foreign key (business_id, inventory_item_id)
    references public.inventory_items (business_id, id)
    on delete cascade
);

create index profiles_business_id_idx on public.profiles (business_id);
create index products_business_name_idx on public.products (business_id, name);
create index customers_business_name_idx on public.customers (business_id, name);
create index orders_business_created_at_idx on public.orders (business_id, created_at desc);
create index orders_business_delivery_date_idx on public.orders (business_id, delivery_date);
create index order_items_business_order_idx on public.order_items (business_id, order_id);
create index inventory_items_business_name_idx on public.inventory_items (business_id, name);
create index inventory_movements_business_item_date_idx on public.inventory_movements (business_id, inventory_item_id, happened_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;

revoke all on public.businesses, public.profiles, public.products, public.customers,
  public.orders, public.order_items, public.inventory_items, public.inventory_movements
from anon;

grant select, update on public.businesses to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.products, public.customers,
  public.orders, public.order_items, public.inventory_items, public.inventory_movements
to authenticated;

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their business"
on public.businesses for select to authenticated
using (id = (select public.current_business_id()));

create policy "Users can update their business"
on public.businesses for update to authenticated
using (id = (select public.current_business_id()))
with check (id = (select public.current_business_id()));

create policy "Business members can manage products"
on public.products for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));

create policy "Business members can manage customers"
on public.customers for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));

create policy "Business members can manage orders"
on public.orders for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));

create policy "Business members can manage order items"
on public.order_items for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));

create policy "Business members can manage inventory items"
on public.inventory_items for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));

create policy "Business members can manage inventory movements"
on public.inventory_movements for all to authenticated
using (business_id = (select public.current_business_id()))
with check (business_id = (select public.current_business_id()));