create extension if not exists vector;
create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  role text not null default 'student' check (role in ('student','rep','tutor','admin')),
  created_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  course text,
  kind text,
  doc_type text,
  storage_path text not null,
  pages_count int,
  chunks_count int,
  visibility text not null default 'personal' check (visibility in ('personal','course')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','archived')),
  status text not null default 'processing' check (status in ('uploading','processing','ready','failed')),
  error_message text,
  size_bytes int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.doc_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid references public.documents(id) on delete cascade,
  page int not null,
  content text not null,
  embedding vector(768),
  usage_count int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mode text not null check (mode in ('ask','drill','reader')),
  doc_id uuid references public.documents(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  metadata jsonb default '{}'::jsonb,
  score int,
  accuracy numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key,
  drill_id uuid references public.drills(id) on delete cascade,
  stem text,
  options text[],
  correct int,
  explanation text,
  citations jsonb default '[]'::jsonb
);

create table if not exists public.matches (
  id bigserial primary key,
  ask_id uuid,
  doc_id uuid references public.documents(id) on delete cascade,
  page int,
  score numeric,
  span text,
  created_at timestamptz default now()
);

create index if not exists doc_chunks_doc_page_idx on public.doc_chunks (doc_id, page);
create index if not exists matches_doc_idx on public.matches (doc_id);
create index if not exists sessions_user_idx on public.sessions (user_id);
create index if not exists documents_user_idx on public.documents (user_id);
create index if not exists doc_chunks_embedding_idx on public.doc_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

drop trigger if exists documents_updated_at on public.documents;
create trigger documents_updated_at
  before update on public.documents
  for each row
  execute function public.handle_updated_at();

drop trigger if exists sessions_updated_at on public.sessions;
create trigger sessions_updated_at
  before update on public.sessions
  for each row
  execute function public.handle_updated_at();

drop trigger if exists drills_updated_at on public.drills;
create trigger drills_updated_at
  before update on public.drills
  for each row
  execute function public.handle_updated_at();

alter table public.profiles
  add column if not exists email text,
  add column if not exists role text
    check (role in ('student','rep','tutor','admin'))
    default 'student';
alter table public.profiles
  alter column role set not null;

alter table public.documents
  add column if not exists doc_type text,
  add column if not exists visibility text
    check (visibility in ('personal','course'))
    default 'personal',
  add column if not exists approval_status text
    check (approval_status in ('pending','approved','archived'))
    default 'pending';
alter table public.documents
  alter column visibility set not null;
alter table public.documents
  alter column approval_status set not null;

alter table public.documents
  drop constraint if exists documents_status_check;

alter table public.documents
  add constraint documents_status_check check (status in ('uploading','processing','ready','failed'));
