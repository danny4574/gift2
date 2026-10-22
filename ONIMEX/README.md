# ONIMEX birthday page

This React/Vite site uses Supabase to store shared guestbook wishes and Memory Lane likes.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Sign In / Providers**, enable **Anonymous Sign-Ins**. The app uses anonymous accounts to give each browser a stable identity and to ensure visitors can only add or remove their own likes.
4. In **Project Settings → API**, copy the Project URL and the `anon` / publishable key. The app only needs the public anon key; never put a `service_role` key in this frontend.

## Run locally

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Then run:

```sh
npm install
npm run dev
```

The `.env.local` file is ignored by Git. If Supabase isn't configured, wishes and likes will show a configuration message and won't be saved.

## Deploy to Vercel

Import this repository into Vercel as a Vite project. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings → Environment Variables** for the environments you use, then redeploy. No Vercel database or server function is needed: the browser writes to Supabase, where row-level security controls access.

The starter wishes shown in the page are static examples from `src/App.jsx`; wishes submitted by visitors are saved in Supabase. Likes are stored per memory and anonymous visitor, so counts are shared and each visitor's liked state persists across visits on the same browser.
