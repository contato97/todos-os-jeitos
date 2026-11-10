-- Feedback da Juliana (Escola):
-- 1. A escola coloca imagem/PDF ou escreve sobre laudos e relatorios feitos
--    pela escola e por especialistas.
-- 2. A escola assina os relatorios pela plataforma e fica salvo, para todos
--    verem (familia, professores e especialistas). Vale tambem para os
--    encaminhamentos.

-- ============================================================
-- 1. Documentos do aluno enviados pela escola
-- ============================================================
create table public.escola_documentos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  escola_id uuid not null references public.escolas (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  tipo text not null check (tipo in ('laudo', 'relatorio_escola', 'relatorio_especialista', 'outro')),
  titulo text not null check (char_length(titulo) between 1 and 160),
  texto text check (char_length(texto) <= 10000),
  arquivo text check (char_length(arquivo) <= 300),       -- caminho no bucket privado
  arquivo_nome text check (char_length(arquivo_nome) <= 200),
  arquivo_tipo text check (char_length(arquivo_tipo) <= 100),
  -- O professor do aluno sempre ve. Familia e especialistas, so se a escola marcar.
  compartilhar_familia boolean not null default false,
  compartilhar_especialistas boolean not null default false,
  created_at timestamptz not null default now(),
  check (texto is not null or arquivo is not null)
);
create index on public.escola_documentos (aluno_id, created_at desc);

alter table public.escola_documentos enable row level security;
create policy "escola gerencia os proprios documentos" on public.escola_documentos for all to authenticated
  using (privado.eh_responsavel_da_escola(escola_id))
  with check (privado.eh_responsavel_da_escola(escola_id) and privado.aluno_da_escola(aluno_id, escola_id));
create policy "professor do aluno ve os documentos da escola" on public.escola_documentos for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id));
create policy "familia ve os documentos compartilhados" on public.escola_documentos for select to authenticated
  using (compartilhar_familia and privado.eh_familia_do_aluno(aluno_id));
create policy "especialista ve os documentos compartilhados" on public.escola_documentos for select to authenticated
  using (compartilhar_especialistas and privado.especialista_ve_aluno(aluno_id, 'relatorios'));

revoke all on public.escola_documentos from anon;
revoke update on public.escola_documentos from authenticated;
grant update (titulo, texto, compartilhar_familia, compartilhar_especialistas) on public.escola_documentos to authenticated;

-- Arquivos: bucket privado, uma pasta por escola. Quem pode ABRIR o arquivo
-- e quem pode ver a linha do documento (o RLS acima decide).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('escola-documentos', 'escola-documentos', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

create policy "escola-documentos: ver quem ve o documento" on storage.objects for select to authenticated
  using (bucket_id = 'escola-documentos'
    and exists (select 1 from public.escola_documentos d where d.arquivo = name));
create policy "escola-documentos: escola envia para a propria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'escola-documentos'
    and exists (select 1 from public.escolas e
      where e.id::text = (storage.foldername(name))[1] and e.responsavel_id = (select auth.uid())));
create policy "escola-documentos: escola apaga os proprios" on storage.objects for delete to authenticated
  using (bucket_id = 'escola-documentos'
    and exists (select 1 from public.escolas e
      where e.id::text = (storage.foldername(name))[1] and e.responsavel_id = (select auth.uid())));

-- ============================================================
-- 2. Assinatura da escola nos relatorios
-- ============================================================
create table public.relatorio_assinaturas (
  id uuid primary key default gen_random_uuid(),
  relatorio_id uuid not null references public.relatorios (id) on delete cascade,
  assinante_id uuid not null references public.perfis (id) on delete cascade,
  nome_assinante text not null check (char_length(nome_assinante) between 3 and 160),
  cargo text check (char_length(cargo) <= 60),
  papel text not null check (papel in ('escola')),
  conteudo_sha256 text not null,
  assinado_em timestamptz not null default now(),
  unique (relatorio_id, assinante_id)
);

-- Quem ve o relatorio ve a assinatura (a familia so os compartilhados)
create function privado.pode_ver_relatorio(p_relatorio uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.relatorios r
    where r.id = p_relatorio and r.status = 'revisado'
      and (privado.eh_professor_do_aluno(r.aluno_id)
        or privado.eh_escola_do_aluno(r.aluno_id)
        or privado.especialista_ve_aluno(r.aluno_id, 'relatorios')
        or (r.compartilhado_com_familia and privado.eh_familia_do_aluno(r.aluno_id)))
  );
$$;

alter table public.relatorio_assinaturas enable row level security;
create policy "quem ve o relatorio ve as assinaturas" on public.relatorio_assinaturas for select to authenticated
  using (privado.pode_ver_relatorio(relatorio_id));
revoke all on public.relatorio_assinaturas from anon;
revoke insert, update, delete on public.relatorio_assinaturas from authenticated;

-- Relatorio assinado: o texto nao muda mais e ele nao pode ser apagado.
-- (Compartilhar ou nao com a familia continua livre.)
create function privado.travar_relatorio_assinado()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.relatorio_assinaturas where relatorio_id = old.id) then
    if tg_op = 'DELETE' then
      -- Apagar o ALUNO inteiro (pedido da familia, LGPD) continua possivel:
      -- nesse caso o aluno ja nao existe quando a exclusao chega aqui
      if not exists (select 1 from public.alunos where id = old.aluno_id) then
        return old;
      end if;
      raise exception 'relatorio_assinado';
    end if;
    if new.versao_familia is distinct from old.versao_familia
       or new.versao_tecnica is distinct from old.versao_tecnica
       or new.status is distinct from old.status
       or new.periodo_inicio is distinct from old.periodo_inicio
       or new.periodo_fim is distinct from old.periodo_fim
       or new.bimestre is distinct from old.bimestre
       or new.ano_letivo is distinct from old.ano_letivo then
      raise exception 'relatorio_assinado';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
create trigger travar_assinado before update or delete on public.relatorios
  for each row execute function privado.travar_relatorio_assinado();

create function public.assinar_relatorio(p_relatorio uuid, p_nome text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  r public.relatorios;
  nova uuid;
  nome_limpo text := left(trim(coalesce(p_nome, '')), 160);
  cargo_escola text;
begin
  select * into r from public.relatorios where id = p_relatorio;
  if not found or r.status <> 'revisado' or not privado.eh_escola_do_aluno(r.aluno_id) then
    raise exception 'sem_acesso';
  end if;
  if char_length(nome_limpo) < 3 then
    raise exception 'nome_invalido';
  end if;
  select cargo_responsavel into cargo_escola from public.escolas
  where responsavel_id = (select auth.uid()) limit 1;

  insert into public.relatorio_assinaturas (relatorio_id, assinante_id, nome_assinante, cargo, papel, conteudo_sha256)
  values (
    r.id, (select auth.uid()), nome_limpo, cargo_escola, 'escola',
    encode(sha256(convert_to(coalesce(r.versao_familia, '') || '|' || coalesce(r.versao_tecnica, ''), 'UTF8')), 'hex')
  )
  returning id into nova;
  return nova;
end;
$$;

-- ============================================================
-- 3. A escola tambem assina os encaminhamentos
-- ============================================================

-- Mesmo cuidado do relatorio: apagar o aluno inteiro continua possivel
create or replace function privado.proteger_encaminhamento_assinado()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.encaminhamento_assinaturas where encaminhamento_id = old.id)
     and exists (select 1 from public.alunos where id = old.aluno_id) then
    raise exception 'encaminhamento_assinado';
  end if;
  return old;
end;
$$;
alter table public.encaminhamento_assinaturas add column cargo text check (char_length(cargo) <= 60);
alter table public.encaminhamento_assinaturas drop constraint encaminhamento_assinaturas_papel_check;
alter table public.encaminhamento_assinaturas add constraint encaminhamento_assinaturas_papel_check
  check (papel in ('familia', 'escola'));

create or replace function public.assinar_encaminhamento(p_encaminhamento uuid, p_nome text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  e public.encaminhamentos;
  nova uuid;
  nome_limpo text := left(trim(coalesce(p_nome, '')), 160);
  papel_assinante text;
  cargo_escola text;
begin
  select * into e from public.encaminhamentos where id = p_encaminhamento;
  if not found or e.status <> 'revisado' then
    raise exception 'sem_acesso';
  end if;
  if privado.eh_escola_do_aluno(e.aluno_id) then
    papel_assinante := 'escola';
    select cargo_responsavel into cargo_escola from public.escolas
    where responsavel_id = (select auth.uid()) limit 1;
  elsif e.compartilhado_com_familia and privado.eh_familia_do_aluno(e.aluno_id) then
    papel_assinante := 'familia';
  else
    raise exception 'sem_acesso';
  end if;
  if char_length(nome_limpo) < 3 then
    raise exception 'nome_invalido';
  end if;

  insert into public.encaminhamento_assinaturas (encaminhamento_id, assinante_id, nome_assinante, papel, cargo, conteudo_sha256)
  values (
    e.id, (select auth.uid()), nome_limpo, papel_assinante, cargo_escola,
    encode(sha256(convert_to(coalesce(e.conteudo, '') || '|' || array_to_string(e.especialidades, ','), 'UTF8')), 'hex')
  )
  returning id into nova;
  return nova;
end;
$$;

revoke execute on function public.assinar_relatorio(uuid, text) from public, anon;
grant execute on function public.assinar_relatorio(uuid, text) to authenticated;
revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;
