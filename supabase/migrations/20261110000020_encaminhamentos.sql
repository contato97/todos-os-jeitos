-- Feedback da Juliana: relatorio de encaminhamento gerado com a IA a partir
-- das dificuldades observadas em sala, simples e objetivo, que a familia
-- assina pela plataforma e que escola e familia podem imprimir.
-- Regra do projeto: a IA nunca sugere diagnostico, so TIPOS de profissional
-- para avaliar (ex.: fonoaudiologo).

create table public.encaminhamentos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  motivo text not null check (char_length(motivo) between 1 and 2000),
  conteudo text check (char_length(conteudo) <= 30000),
  -- tipos de profissional sugeridos (mesmos valores da profissao do especialista)
  especialidades text[] not null default '{}' check (
    especialidades <@ array['psicologo', 'psicopedagogo', 'neuropsicopedagogo', 'neuropsicologo',
      'terapeuta_ocupacional', 'fonoaudiologo', 'neuropediatra', 'psiquiatra', 'fisioterapeuta']
  ),
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado')),
  compartilhado_com_familia boolean not null default false,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (not compartilhado_com_familia or status = 'revisado')
);
create index on public.encaminhamentos (aluno_id, created_at desc);

create trigger atualizar_encaminhamentos before update on public.encaminhamentos
  for each row execute function public.marcar_atualizacao();

-- Assinaturas: so pela funcao assinar_encaminhamento (ninguem grava direto).
-- conteudo_sha256 guarda a "impressao digital" do texto assinado: qualquer
-- mudanca no texto mudaria esse codigo.
create table public.encaminhamento_assinaturas (
  id uuid primary key default gen_random_uuid(),
  encaminhamento_id uuid not null references public.encaminhamentos (id) on delete cascade,
  assinante_id uuid not null references public.perfis (id) on delete cascade,
  nome_assinante text not null check (char_length(nome_assinante) between 3 and 160),
  papel text not null check (papel in ('familia')),
  conteudo_sha256 text not null,
  assinado_em timestamptz not null default now(),
  unique (encaminhamento_id, assinante_id)
);

-- Depois da primeira assinatura, o texto nao pode mais mudar
create function privado.travar_encaminhamento_assinado()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.encaminhamento_assinaturas where encaminhamento_id = old.id)
     and (new.conteudo is distinct from old.conteudo
       or new.especialidades is distinct from old.especialidades
       or new.motivo is distinct from old.motivo
       or new.status is distinct from old.status
       or new.compartilhado_com_familia is distinct from old.compartilhado_com_familia) then
    raise exception 'encaminhamento_assinado';
  end if;
  return new;
end;
$$;
create trigger travar_assinado before update on public.encaminhamentos
  for each row execute function privado.travar_encaminhamento_assinado();

-- Encaminhamento assinado tambem nao pode ser apagado (fica para a pasta do aluno)
create function privado.proteger_encaminhamento_assinado()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.encaminhamento_assinaturas where encaminhamento_id = old.id) then
    raise exception 'encaminhamento_assinado';
  end if;
  return old;
end;
$$;
create trigger proteger_assinado before delete on public.encaminhamentos
  for each row execute function privado.proteger_encaminhamento_assinado();

alter table public.encaminhamentos enable row level security;
alter table public.encaminhamento_assinaturas enable row level security;

create policy "professor gerencia os proprios encaminhamentos" on public.encaminhamentos for all to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()) and privado.eh_professor_do_aluno(aluno_id));
create policy "familia ve os encaminhamentos compartilhados" on public.encaminhamentos for select to authenticated
  using (compartilhado_com_familia and status = 'revisado' and privado.eh_familia_do_aluno(aluno_id));
create policy "escola ve os encaminhamentos revisados" on public.encaminhamentos for select to authenticated
  using (status = 'revisado' and privado.eh_escola_do_aluno(aluno_id));
create policy "especialista ve os encaminhamentos compartilhados" on public.encaminhamentos for select to authenticated
  using (compartilhado_com_familia and status = 'revisado' and privado.especialista_ve_aluno(aluno_id, 'relatorios'));

create policy "quem ve o encaminhamento ve as assinaturas" on public.encaminhamento_assinaturas for select to authenticated
  using (exists (select 1 from public.encaminhamentos e where e.id = encaminhamento_id));

revoke all on public.encaminhamentos, public.encaminhamento_assinaturas from anon;
revoke update on public.encaminhamentos from authenticated;
grant update (motivo, conteudo, especialidades, status, compartilhado_com_familia) on public.encaminhamentos to authenticated;
revoke insert, update, delete on public.encaminhamento_assinaturas from authenticated;

create function public.assinar_encaminhamento(p_encaminhamento uuid, p_nome text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  e public.encaminhamentos;
  nova uuid;
  nome_limpo text := left(trim(coalesce(p_nome, '')), 160);
begin
  select * into e from public.encaminhamentos where id = p_encaminhamento;
  if not found or not e.compartilhado_com_familia or e.status <> 'revisado'
     or not privado.eh_familia_do_aluno(e.aluno_id) then
    raise exception 'sem_acesso';
  end if;
  if char_length(nome_limpo) < 3 then
    raise exception 'nome_invalido';
  end if;

  insert into public.encaminhamento_assinaturas (encaminhamento_id, assinante_id, nome_assinante, papel, conteudo_sha256)
  values (
    e.id, (select auth.uid()), nome_limpo, 'familia',
    encode(sha256(convert_to(coalesce(e.conteudo, '') || '|' || array_to_string(e.especialidades, ','), 'UTF8')), 'hex')
  )
  returning id into nova;
  return nova;
end;
$$;

revoke execute on function public.assinar_encaminhamento(uuid, text) from public, anon;
grant execute on function public.assinar_encaminhamento(uuid, text) to authenticated;
revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;

-- O encaminhamento gerado pela IA conta 1 credito
alter table public.ia_uso drop constraint ia_uso_acao_check;
alter table public.ia_uso add constraint ia_uso_acao_check
  check (acao in ('adaptar', 'relatorio', 'reforco', 'moderacao', 'encaminhamento'));
