begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  phone_verified boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  txnid text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  subtotal_paise integer not null check (subtotal_paise > 0),
  gst_paise integer not null check (gst_paise >= 0),
  total_paise integer not null check (total_paise = subtotal_paise + gst_paise),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'pending',
  payu_mihpayid text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payment_orders_user_id_idx on public.payment_orders(user_id, created_at desc);

create table if not exists public.course_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  source_txnid text not null references public.payment_orders(txnid),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, course_slug)
);

create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  txnid text references public.payment_orders(txnid) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.payment_orders enable row level security;
alter table public.course_entitlements enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "profile_select_own" on public.profiles;
drop policy if exists "profile_update_own" on public.profiles;
drop policy if exists "orders_select_own" on public.payment_orders;
drop policy if exists "entitlements_select_own" on public.course_entitlements;

create policy "profile_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "orders_select_own" on public.payment_orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "entitlements_select_own" on public.course_entitlements for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set email = excluded.email, full_name = coalesce(public.profiles.full_name, excluded.full_name), avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url), updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email, raw_user_meta_data on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.finalize_course_purchase(p_txnid text, p_mihpayid text, p_verified_status text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare v_order public.payment_orders%rowtype;
begin
  select * into v_order from public.payment_orders where txnid = p_txnid for update;
  if not found then raise exception 'payment order not found'; end if;
  if lower(p_verified_status) <> 'success' then raise exception 'payment is not successful'; end if;

  update public.payment_orders set status = 'paid', payu_mihpayid = coalesce(p_mihpayid, payu_mihpayid), paid_at = coalesce(paid_at, now()), updated_at = now() where txnid = p_txnid;
  insert into public.course_entitlements(user_id, course_slug, source_txnid, granted_at, revoked_at)
  values(v_order.user_id, v_order.course_slug, p_txnid, now(), null)
  on conflict(user_id, course_slug) do update set source_txnid = excluded.source_txnid, granted_at = excluded.granted_at, revoked_at = null;
end;
$$;

create or replace function public.mark_course_payment_inactive(p_txnid text, p_status text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare v_order public.payment_orders%rowtype;
begin
  select * into v_order from public.payment_orders where txnid = p_txnid for update;
  if not found then return; end if;
  update public.payment_orders set status = p_status, updated_at = now() where txnid = p_txnid;
  if not exists (select 1 from public.payment_orders where user_id = v_order.user_id and course_slug = v_order.course_slug and status = 'paid' and txnid <> p_txnid) then
    update public.course_entitlements set revoked_at = now() where user_id = v_order.user_id and course_slug = v_order.course_slug and source_txnid = p_txnid;
  end if;
end;
$$;

revoke all on function public.finalize_course_purchase(text,text,text) from public, anon, authenticated;
revoke all on function public.mark_course_payment_inactive(text,text) from public, anon, authenticated;
grant execute on function public.finalize_course_purchase(text,text,text) to service_role;
grant execute on function public.mark_course_payment_inactive(text,text) to service_role;

commit;
