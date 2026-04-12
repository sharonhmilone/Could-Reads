-- Could Reads — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query

create table if not exists public.books (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  author                text not null,
  recommender           text not null,
  friend_note           text,
  date_added            timestamptz not null default now(),
  ai_pitch              text,
  taste_score           smallint check (taste_score between 1 and 10),
  ai_pitch_generated_at timestamptz
);

-- Row Level Security
alter table public.books enable row level security;

-- Public read — anyone can view the book list
create policy "public read"
  on public.books for select
  using (true);

-- Public insert — anyone with the suggest link can add a book
create policy "public insert"
  on public.books for insert
  with check (true);

-- Public update — needed for writing AI pitch / taste score back
create policy "public update"
  on public.books for update
  using (true);

-- Public delete — owner can remove books (no auth required for this app)
create policy "public delete"
  on public.books for delete
  using (true);

-- Enable Realtime so all connected clients see live updates
alter publication supabase_realtime add table public.books;
