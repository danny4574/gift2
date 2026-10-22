create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  relation text not null check (relation in ('Family', 'Friend', 'Neighbour', 'Colleague')),
  message text not null check (char_length(message) between 1 and 400),
  created_at timestamptz not null default now()
);

create table if not exists public.memory_likes (
  memory_id text not null,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, visitor_id)
);

alter table public.memory_likes
  drop constraint if exists memory_likes_memory_id_check;
alter table public.memory_likes
  add constraint memory_likes_memory_id_check
  check (memory_id in (
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9',
    'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'm16', 'm45'
  ));

alter table public.wishes enable row level security;
alter table public.memory_likes enable row level security;

drop policy if exists "Anyone can read wishes" on public.wishes;
create policy "Anyone can read wishes"
  on public.wishes for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can post wishes" on public.wishes;
create policy "Anyone can post wishes"
  on public.wishes for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can read memory likes" on public.memory_likes;
create policy "Anyone can read memory likes"
  on public.memory_likes for select
  to anon, authenticated
  using (true);

drop policy if exists "Visitors can like as themselves" on public.memory_likes;
create policy "Visitors can like as themselves"
  on public.memory_likes for insert
  to authenticated
  with check (visitor_id = (select auth.uid()));

drop policy if exists "Visitors can remove their own likes" on public.memory_likes;
create policy "Visitors can remove their own likes"
  on public.memory_likes for delete
  to authenticated
  using (visitor_id = (select auth.uid()));

grant select, insert on public.wishes to anon, authenticated;
grant select on public.memory_likes to anon;
grant select, insert, delete on public.memory_likes to authenticated;
