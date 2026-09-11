# Gaming YouTuber Course — Supabase + Google Auth + PayU

Production-oriented Next.js 16 course website with a premium responsive landing experience, Google login via Supabase, Supabase Postgres lifetime entitlements, phone capture, and PayU Hosted Checkout.

## Included

- Premium black/red responsive landing page with a boxed-grid hero background and mobile-centered hero hierarchy.
- Six-channel mentor proof section. Channel names and links are controlled through environment variables.
- Eight-module curriculum across the landing page and protected course outline.
- Modern two-panel Google login experience without changing the existing Manrope font system.
- Google OAuth through Supabase Auth.
- User profile stored in Supabase (`profiles`) with name, email and phone.
- Phone is collected once at checkout because Google OAuth does not reliably provide it.
- Server-owned course price from `COURSE_PRICE_INR`; GST is calculated at 18% on the server.
- PayU request hashing, reverse-response hash validation, and server-to-server `verify_payment` verification.
- Pending payment order is created before redirecting to PayU, so callback processing does not depend on browser cookies.
- Atomic `finalize_course_purchase` database function grants lifetime entitlement after verified successful payment.
- `/opencourse` is protected by Supabase account identity + active lifetime entitlement.
- Same Google account can regain access on another device/browser.
- Row Level Security enabled for profiles, orders, and entitlements.
- Complete Terms, Privacy and Contact pages. No public refund-policy route is included.
- Supabase secret key and PayU salt stay server-only.

## Quick setup

See `README-SETUP.md` for the exact setup sequence.

1. Run `npm install`.
2. Create a Supabase project.
3. Run `supabase/migrations/202609120001_course_platform.sql` in Supabase SQL Editor.
4. Enable Google under Supabase Authentication > Providers and configure Google OAuth.
5. Copy `.env.example` to `.env.local` and fill Supabase + PayU credentials.
6. Add the six YouTube channel names/URLs to the mentor variables if you want the cards clickable.
7. Start with `PAYU_ENV=test` and run `npm run dev`.
8. Configure PayU payment webhooks to `https://YOUR_DOMAIN/api/payu/webhook`.
9. After end-to-end testing, switch to live PayU credentials and `PAYU_ENV=live`.

## Payment flow

```text
Buy
  -> Google login
  -> Name/email loaded from Google
  -> Phone collected/saved in Supabase
  -> Server creates pending order
  -> PayU Hosted Checkout
  -> PayU POST callback
  -> Reverse hash validation
  -> PayU Verify Payment API
  -> Atomic lifetime entitlement grant in Supabase
  -> /opencourse
```

## Security

Do not commit `.env.local`. Never expose `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `PAYU_SALT` in browser/client code.
