-- Documentos do aluno (laudos, relatorios de profissionais de saude).
-- Dado sensivel (LGPD): so o professor do aluno ve. Nunca vai para a IA.

create table public.alunos_documentos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  nome_original text not null check (char_length(nome_original) between 1 and 200),
  descricao text check (char_length(descricao) <= 300),
  caminho text not null unique,  -- caminho no bucket privado "documentos"
  tipo text not null,
  tamanho integer not null check (tamanho > 0),
  created_at timestamptz not null default now()
);
create index on public.alunos_documentos (aluno_id, created_at desc);

alter table public.alunos_documentos enable row level security;

-- Apenas o professor do aluno: ver, anexar e apagar. Escola e familia NAO veem.
create policy "so o professor ve os documentos" on public.alunos_documentos for select to authenticated
  using (professor_id = (select auth.uid()) and privado.eh_professor_do_aluno(aluno_id));
create policy "so o professor anexa documentos" on public.alunos_documentos for insert to authenticated
  with check (professor_id = (select auth.uid()) and privado.eh_professor_do_aluno(aluno_id));
create policy "so o professor apaga documentos" on public.alunos_documentos for delete to authenticated
  using (professor_id = (select auth.uid()));

revoke update on public.alunos_documentos from anon, authenticated;
grant update (descricao) on public.alunos_documentos to authenticated;
create policy "professor edita a descricao" on public.alunos_documentos for update to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()));

-- Bucket privado separado, com os formatos aceitos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos', 'documentos', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Arquivos em documentos/{id do professor}/{id do aluno}/...
create policy "documentos: ver os proprios" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documentos: enviar para a propria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documentos: apagar os proprios" on storage.objects for delete to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
