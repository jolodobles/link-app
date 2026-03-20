# link. — swipe together, decide together

A mobile-first group event planning app where friends swipe Tinder-style on venue options. When enough people swipe yes on the same place, it's a match.

## Quick start (demo mode)

No setup required — just run:

```bash
npm install
npm run dev
```

The app runs in **demo mode** when Supabase isn't configured. Fake swipes are simulated so every screen is fully testable.

---

## Full setup with Supabase

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to provision

### 2. Run the schema

1. In the Supabase dashboard, open **SQL Editor**
2. Paste the contents of `supabase/schema.sql` and run it
3. This creates all tables, enables realtime, sets RLS policies, and seeds the venues

### 3. Add environment variables

Copy your Supabase project credentials:

- **Project URL**: Settings → API → Project URL
- **Anon key**: Settings → API → `anon` `public` key

Create/update `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run locally

```bash
npm run dev
```

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

The `vercel.json` rewrite rule handles client-side routing.

---

## App flow

| Route | Screen |
|-------|--------|
| `/` | Session setup — pick category, budget, invite friends |
| `/join/:sessionId` | Join screen — enter name when opening an invite link |
| `/swipe/:sessionId` | Swipe cards — drag or tap to vote on venues |
| `/live/:sessionId` | Live activity — watch friends swipe in real time |
| `/match/:sessionId` | Match result — confetti + venue details + actions |

## Tech stack

- **Vite + React** — frontend
- **Tailwind CSS v4** — styling
- **Framer Motion** — swipe card animations
- **React Router** — navigation
- **Supabase** — database + realtime subscriptions
- **canvas-confetti** — match screen celebration
