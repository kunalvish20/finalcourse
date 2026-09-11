# Production setup: Supabase + Google + PayU

## 1) Install

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

On Windows, create `.env.local` manually from `.env.example`.

## 2) Supabase

Create a project, open **SQL Editor**, and run:

`supabase/migrations/202609120001_course_platform.sql`

Confirm these tables exist in Table Editor:

- `profiles`
- `payment_orders`
- `course_entitlements`
- `payment_events`

In **Authentication > Providers**, enable Google. In Google Cloud, use the callback URL shown by Supabase. In **Authentication > URL Configuration**, add local `http://localhost:3000/auth/callback` and your production callback URL.

Fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

## 3) Website + mentor links

For local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

The mentor section supports six channel cards. Fill `NEXT_PUBLIC_CHANNEL_1_NAME` / `NEXT_PUBLIC_CHANNEL_1_URL` through channel 6. Empty URLs remain visible but non-clickable.

## 4) PayU

Fill `PAYU_KEY` and `PAYU_SALT`. Keep:

```env
PAYU_ENV=test
```

until the complete test flow succeeds. For production use your live credentials and:

```env
PAYU_ENV=live
```

Configure the PayU webhook URL:

`https://YOUR_DOMAIN/api/payu/webhook`

The callback URL is generated automatically as:

`https://YOUR_DOMAIN/api/payu/callback`

## 5) Pricing

Set:

```env
COURSE_PRICE_INR=499
```

The server owns the price and calculates GST at 18%. With `499` the totals are:

- Course: ₹499.00
- GST 18%: ₹89.82
- Total charged: ₹588.82

The landing page MRP strike-through is controlled separately by:

```env
NEXT_PUBLIC_COURSE_MRP="₹1,999"
```

## 6) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## 7) Production flow

```text
Buy -> Google login -> phone number -> PayU -> callback + Verify Payment API
-> atomic lifetime entitlement in Supabase -> /opencourse
```

A failed, disputed, reversed or independently verified refunded payment can invalidate the related entitlement in the backend. This safety logic is independent of the public website pages.
