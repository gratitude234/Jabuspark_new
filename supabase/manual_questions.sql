-- Manual questions table for admin-authored MCQs
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  stem text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index between 0 and 7),
  explanation text,
  difficulty text check (difficulty in ('easy','medium','hard')),
  page_hint integer,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index if not exists questions_document_id_idx on public.questions(document_id);

-- RLS
alter table public.questions enable row level security;

-- Any authenticated user can read questions
create policy if not exists "Questions readable" on public.questions
for select using (auth.role() = 'authenticated');

-- Only admins (role = admin/super_admin) can write
create policy if not exists "Questions admin insert" on public.questions
for insert
with check (
  exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
  )
);

create policy if not exists "Questions admin update" on public.questions
for update
using (
  exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
  )
)
with check (
  exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
  )
);

create policy if not exists "Questions admin delete" on public.questions
for delete
using (
  exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
  )
);
