# Finny web app

Built with React, Vite, Supabase Auth, and responsive CSS.

## Local setup

1. Install dependencies with `npm install`.
2. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (the file is ignored by Git).
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. It provisions the private profile, deposit, and spending tables and adds monthly budget and reminder settings plus spending notes, editable dates, and purchase confirmation dates.
4. Start the app with `npm run dev`.

The schema uses row-level security to restrict records to the signed-in user. Use only the Supabase publishable key in the browser, never a service-role key.
