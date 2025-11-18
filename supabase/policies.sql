alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.doc_chunks enable row level security;
alter table public.sessions enable row level security;
alter table public.drills enable row level security;
alter table public.questions enable row level security;
alter table public.matches enable row level security;
alter table if exists storage.objects enable row level security;

create policy "Profiles readable" on public.profiles for select using (true);
create policy "Profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Create own profile" on public.profiles for insert with check (id = auth.uid());

create policy "Own docs" on public.documents
for all
using (user_id = auth.uid())
with check (
  auth.uid() = user_id
  and (
    visibility is null
    or visibility = 'personal'
    or (
      visibility = 'course'
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('rep','tutor','admin')
      )
    )
  )
);

create policy "Insert documents by role"
on public.documents
for insert
with check (
  auth.uid() = user_id
  and (
    visibility is null
    or visibility = 'personal'
    or (
      visibility = 'course'
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('rep','tutor','admin')
      )
    )
  )
);

create policy "Select documents by ownership or course visibility"
on public.documents
for select
using (
  ((visibility is null or visibility = 'personal') and user_id = auth.uid())
  or visibility = 'course'
);

create policy "Chunks owned" on public.doc_chunks for select using (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
);
create policy "Chunks insert" on public.doc_chunks for insert with check (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
);
create policy "Chunks update" on public.doc_chunks for update using (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
) with check (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
);
create policy "Chunks delete" on public.doc_chunks for delete using (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
);

create policy "Own sessions" on public.sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own drills" on public.drills for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Own questions" on public.questions for all using (
  exists(select 1 from public.drills dr where dr.id = drill_id and dr.user_id = auth.uid())
) with check (
  exists(select 1 from public.drills dr where dr.id = drill_id and dr.user_id = auth.uid())
);

create policy "Own matches" on public.matches for all using (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
) with check (
  exists(select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
);

create policy "Docs bucket read" on storage.objects for select using (
  bucket_id = 'docs'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

create policy "Docs bucket write" on storage.objects for insert with check (
  bucket_id = 'docs'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

create policy "Docs bucket delete" on storage.objects for delete using (
  bucket_id = 'docs'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);
