insert into auth.users (id, email, encrypted_password)
values ('11111111-2222-3333-4444-555555555555', 'demo@jabuspark.app', '$2a$12$abcdefghijklmnopqrstuv')
on conflict (id) do nothing;

insert into public.profiles (id, full_name, email, role)
values ('11111111-2222-3333-4444-555555555555', 'Demo Cadet', 'demo@jabuspark.app', 'admin')
on conflict (id) do nothing;

insert into public.documents (id, user_id, title, course, kind, doc_type, storage_path, pages_count, chunks_count, status, visibility, approval_status, error_message, size_bytes)
values (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  '11111111-2222-3333-4444-555555555555',
  'Sample Immunology Notes',
  'ANA 203',
  'handout',
  'Lecture handout',
  'user/11111111-2222-3333-4444-555555555555/sample.pdf',
  3,
  6,
  'ready',
  'course',
  'approved',
  null,
  102400
)
on conflict (id) do nothing;

insert into public.doc_chunks (doc_id, page, content)
values
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 1, 'Immune response begins with antigen recognition and activation of innate cells.'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2, 'Adaptive immunity tailors antibodies specifically for each pathogen.'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 3, 'Memory cells ensure rapid response in subsequent exposures.');
