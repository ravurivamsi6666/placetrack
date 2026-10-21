# PlaceTrack

Student placement preparation and application tracker. Built with React (Vite), Tailwind CSS v4 and Supabase (PostgreSQL + Auth).

## Features

- **Dashboard**: total / in-progress / interview / offer counts, status distribution chart, upcoming deadlines, prep progress
- **Applications**: add, edit, delete (with confirmation), search by company or role, filter by status, sort by applied date or deadline, quick status change
- **Prep tasks**: title, subject (DSA, SQL, OOP, DBMS, ML, ...), due date, tick off, pending / completed tabs
- **Deadlines**: application deadlines, interview dates and prep tasks in date order; overdue and due-within-3-days highlighted
- **Auth**: email/password sign-up and login; Row Level Security so each user sees only their own data
- Responsive layout (sidebar on desktop, drawer on mobile), loading / empty / error states

## Setup

### 1. Create the Supabase project
1. Create a free project at https://supabase.com.
2. Open **SQL Editor -> New query**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. (Optional, for quicker local testing) **Authentication -> Providers -> Email**: turn off "Confirm email" so you can sign in right after signing up.

### 2. Configure environment variables
```bash
cp .env.example .env
```
Fill in from **Project Settings -> API**:
- `VITE_SUPABASE_URL`: the project URL
- `VITE_SUPABASE_ANON_KEY`: the **anon / publishable** key

Never use the `service_role` key in this app. It bypasses Row Level Security.

### 3. Run
```bash
npm install
npm run dev
```
Open http://localhost:5173, create an account, and start adding applications.

## Project structure

```
supabase/schema.sql        tables, constraints, indexes, RLS policies
src/lib/supabase.js        Supabase client (anon key only)
src/lib/api.js             all database calls (create / read / update / delete)
src/lib/dates.js           date helpers + deadline urgency logic
src/context/AuthContext    login state
src/components/            Layout, UI pieces, forms, chart
src/pages/                 Dashboard, Applications, Prep, Deadlines, Login
```

## Deploying (Vercel)

1. Push the repo to GitHub (`.env` is git-ignored).
2. Import the repo in Vercel (framework preset: Vite).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings -> Environment Variables**.
4. Deploy. `vercel.json` makes direct links like `/prep` work.
5. In Supabase **Authentication -> URL Configuration**, set the Site URL to your Vercel URL.

## Notes

- `applications` has one column beyond the original spec: `interview_date` (optional), so interviews can appear on the Deadlines page.
- If you re-run `schema.sql` it won't wipe data; tables and policies are created idempotently.
