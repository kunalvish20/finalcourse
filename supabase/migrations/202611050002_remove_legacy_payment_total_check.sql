begin;

-- Some existing projects also have an unnamed table-level price check. Its
-- generated name is payment_orders_check, and it still requires the total to
-- equal subtotal + GST even after the DAX100 migration adds discount support.
do $$
declare
  legacy_definition text;
  current_definition text;
begin
  select pg_get_constraintdef(oid) into current_definition
  from pg_constraint
  where conrelid = 'public.payment_orders'::regclass
    and conname = 'payment_orders_total_paise_check'
    and contype = 'c';

  if current_definition is null or current_definition not ilike '%discount_paise%' then
    raise exception 'Discount-aware payment_orders_total_paise_check is missing; run the DAX100 migration first';
  end if;

  select pg_get_constraintdef(oid) into legacy_definition
  from pg_constraint
  where conrelid = 'public.payment_orders'::regclass
    and conname = 'payment_orders_check'
    and contype = 'c';

  if legacy_definition is not null then
    if legacy_definition not ilike '%total_paise%'
       or legacy_definition not ilike '%subtotal_paise%'
       or legacy_definition not ilike '%gst_paise%'
       or legacy_definition ilike '%discount_paise%' then
      raise exception 'payment_orders_check is not the expected legacy price constraint: %', legacy_definition;
    end if;

    alter table public.payment_orders drop constraint payment_orders_check;
  end if;
end;
$$;

commit;
