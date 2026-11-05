begin;

alter table public.payment_orders
  add column coupon_code text,
  add column discount_paise integer not null default 0;

alter table public.payment_orders
  drop constraint payment_orders_total_paise_check;

alter table public.payment_orders
  add constraint payment_orders_discount_paise_check
    check (discount_paise >= 0 and discount_paise <= subtotal_paise + gst_paise),
  add constraint payment_orders_coupon_code_check
    check ((coupon_code is null and discount_paise = 0) or (coupon_code = 'DAX100' and discount_paise = least(10000, subtotal_paise + gst_paise))),
  add constraint payment_orders_total_paise_check
    check (total_paise = subtotal_paise + gst_paise - discount_paise and total_paise >= 0);

create or replace function public.finalize_zero_total_coupon_purchase(p_txnid text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare v_order public.payment_orders%rowtype;
begin
  select * into v_order from public.payment_orders where txnid = p_txnid for update;
  if not found then raise exception 'payment order not found'; end if;
  if v_order.status is distinct from 'pending' or v_order.total_paise <> 0 or v_order.coupon_code is distinct from 'DAX100'
     or v_order.discount_paise <> v_order.subtotal_paise + v_order.gst_paise then
    raise exception 'not a valid zero-total coupon order';
  end if;

  update public.payment_orders set status = 'paid', paid_at = now(), updated_at = now() where txnid = p_txnid;
  insert into public.course_entitlements(user_id, course_slug, source_txnid, granted_at, revoked_at)
  values(v_order.user_id, v_order.course_slug, p_txnid, now(), null)
  on conflict(user_id, course_slug) do update set source_txnid = excluded.source_txnid, granted_at = excluded.granted_at, revoked_at = null;
  insert into public.payment_events(txnid, event_type, payload)
  values(p_txnid, 'zero_total_coupon_granted', jsonb_build_object('coupon_code', 'DAX100', 'discount_paise', v_order.discount_paise));
end;
$$;

revoke all on function public.finalize_zero_total_coupon_purchase(text) from public, anon, authenticated;
grant execute on function public.finalize_zero_total_coupon_purchase(text) to service_role;

commit;
