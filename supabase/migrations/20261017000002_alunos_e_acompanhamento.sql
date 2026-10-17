-- Estrutura completa do acompanhamento: alunos, saude, familias, escola,
-- convites, observacoes, atividades, relatorios, reforco e arquivos.
-- Rode DEPOIS do arquivo 20261017000001. SQL Editor > New query > colar > Run.
--
-- Regra de ouro (LGPD): cada tabela tem RLS ligado e so libera o que a policy diz.
--   professor -> tudo dos PROPRIOS alunos
--   familia   -> so o proprio filho, depois de dar consentimento, e so o que foi compartilhado
--   escola    -> so leitura, dos alunos dos professores vinculados a ela

-- ============================================================
-- 1. Tabelas
-- ============================================================

-- Perfil vivo do aluno
create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  data_nascimento date,
  ano_escolar text,
  interesses text,
  pontos_fortes text,
  o_que_funciona text,
  o_que_trava text,
  comunicacao text,   -- como prefere receber instrucoes
  sensorial text,     -- sensibilidade a sons, luz, toque...
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Informacao de saude fica separada: so o professor ve, e nunca vai para a IA
create table public.alunos_saude (
  aluno_id uuid primary key references public.alunos (id) on delete cascade,
  informacoes text, -- diagnostico/laudo INFORMADO pela familia (nunca inferido)
  atualizado_em timestamptz not null default now()
);

-- Escola <-> professores vinculados
create table public.escola_professores (
  escola_id uuid not null references public.escolas (id) on delete cascade,
  professor_id uuid not null references public.professores (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (escola_id, professor_id)
);

-- Familia <-> aluno. Sem consentimento registrado, a familia nao ve nada.
create table public.aluno_familias (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  familia_id uuid not null references public.perfis (id) on delete cascade,
  parentesco text,
  consentimento_em timestamptz,
  created_at timestamptz not null default now(),
  primary key (aluno_id, familia_id)
);

-- Convites: familia (para um aluno) ou professor (para uma escola)
create table public.convites (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  tipo text not null check (tipo in ('familia', 'professor')),
  criado_por uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  email text not null check (email = lower(email)),
  aluno_id uuid references public.alunos (id) on delete cascade,
  escola_id uuid references public.escolas (id) on delete cascade,
  parentesco text,
  expira_em timestamptz not null default now() + interval '7 days',
  usado_em timestamptz,
  created_at timestamptz not null default now(),
  check (
    (tipo = 'familia' and aluno_id is not null and escola_id is null)
    or (tipo = 'professor' and escola_id is not null and aluno_id is null)
  )
);

-- Observacoes: da escola (professor) ou de casa (familia)
create table public.observacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  origem text not null check (origem in ('escola', 'casa')),
  texto text not null check (char_length(texto) between 1 and 5000),
  data_observacao date not null default current_date,
  -- So vale para observacoes da escola: o professor escolhe o que a familia ve
  visivel_familia boolean not null default false,
  created_at timestamptz not null default now()
);

-- Atividades adaptadas pela IA (sempre rascunho ate o professor revisar)
create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  texto_original text,
  arquivo_original text, -- caminho no Storage
  conteudo_adaptado text,
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado')),
  compartilhado_com_familia boolean not null default false,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (not compartilhado_com_familia or status = 'revisado')
);

-- Relatorios em duas versoes (familia e tecnica)
create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null check (periodo_fim >= periodo_inicio),
  versao_familia text,
  versao_tecnica text,
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado')),
  compartilhado_com_familia boolean not null default false,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (not compartilhado_com_familia or status = 'revisado')
);

-- Reforco e licao de casa com apoio da IA (a IA conversa com o adulto)
create table public.reforcos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  familia_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  tipo text not null check (tipo in ('reforco', 'licao')),
  pedido text not null check (char_length(pedido) between 1 and 5000),
  arquivo text, -- foto da licao no Storage (opcional)
  resposta text,
  created_at timestamptz not null default now()
);

-- Indices para as consultas mais comuns (listar por aluno, por data)
create index on public.alunos (professor_id);
create index on public.observacoes (aluno_id, data_observacao desc);
create index on public.atividades (aluno_id, created_at desc);
create index on public.relatorios (aluno_id, created_at desc);
create index on public.reforcos (aluno_id, created_at desc);
create index on public.aluno_familias (familia_id);
create index on public.escola_professores (professor_id);

-- ============================================================
-- 2. Atualizar "atualizado_em" automaticamente
-- ============================================================
create function public.marcar_atualizacao()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger atualizar_alunos before update on public.alunos
  for each row execute function public.marcar_atualizacao();
create trigger atualizar_alunos_saude before update on public.alunos_saude
  for each row execute function public.marcar_atualizacao();
create trigger atualizar_atividades before update on public.atividades
  for each row execute function public.marcar_atualizacao();
create trigger atualizar_relatorios before update on public.relatorios
  for each row execute function public.marcar_atualizacao();

-- ============================================================
-- 3. Funcoes de permissao
-- "security definer" deixa a funcao consultar outras tabelas sem cair
-- nas policies delas (evita regras que se chamam em circulo).
-- Todas olham para auth.uid(): o usuario logado.
-- ============================================================
create function public.eh_professor_do_aluno(p_aluno uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.alunos where id = p_aluno and professor_id = (select auth.uid())
  );
$$;

create function public.eh_familia_do_aluno(p_aluno uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.aluno_familias
    where aluno_id = p_aluno and familia_id = (select auth.uid())
      and consentimento_em is not null
  );
$$;

create function public.eh_escola_do_professor(p_professor uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.escola_professores ep
    join public.escolas e on e.id = ep.escola_id
    where ep.professor_id = p_professor and e.responsavel_id = (select auth.uid())
  );
$$;

create function public.eh_escola_do_aluno(p_aluno uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.alunos a
    where a.id = p_aluno and public.eh_escola_do_professor(a.professor_id)
  );
$$;

create function public.eh_responsavel_da_escola(p_escola uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.escolas where id = p_escola and responsavel_id = (select auth.uid())
  );
$$;

create function public.professor_pertence_a_escola(p_escola uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.escola_professores
    where escola_id = p_escola and professor_id = (select auth.uid())
  );
$$;

-- Pessoas que podem ver o nome umas das outras (ex.: professor ve o nome
-- da familia do aluno; familia ve o nome do professor; escola ve seus professores)
create function public.pode_ver_perfil(p_perfil uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select
    public.eh_escola_do_professor(p_perfil)
    or exists ( -- professor -> familias dos seus alunos
      select 1 from public.aluno_familias af
      join public.alunos a on a.id = af.aluno_id
      where af.familia_id = p_perfil and a.professor_id = (select auth.uid())
    )
    or exists ( -- familia -> professor do filho
      select 1 from public.alunos a
      join public.aluno_familias af on af.aluno_id = a.id
      where a.professor_id = p_perfil and af.familia_id = (select auth.uid())
        and af.consentimento_em is not null
    );
$$;

-- ============================================================
-- 4. Row Level Security
-- ============================================================
alter table public.alunos enable row level security;
alter table public.alunos_saude enable row level security;
alter table public.escola_professores enable row level security;
alter table public.aluno_familias enable row level security;
alter table public.convites enable row level security;
alter table public.observacoes enable row level security;
alter table public.atividades enable row level security;
alter table public.relatorios enable row level security;
alter table public.reforcos enable row level security;

-- Perfis e professores (complementa o arquivo 0001)
create policy "ver perfis relacionados" on public.perfis for select to authenticated
  using (public.pode_ver_perfil(id));
create policy "escola ve dados dos seus professores" on public.professores for select to authenticated
  using (public.eh_escola_do_professor(id));
create policy "professor ve escolas a que pertence" on public.escolas for select to authenticated
  using (public.professor_pertence_a_escola(id));

-- Alunos
create policy "professor gerencia os proprios alunos" on public.alunos for all to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()));
create policy "familia ve o proprio filho" on public.alunos for select to authenticated
  using (public.eh_familia_do_aluno(id));
create policy "escola ve alunos dos seus professores" on public.alunos for select to authenticated
  using (public.eh_escola_do_professor(professor_id));

-- Saude: so o professor do aluno
create policy "so o professor ve e edita saude" on public.alunos_saude for all to authenticated
  using (public.eh_professor_do_aluno(aluno_id))
  with check (public.eh_professor_do_aluno(aluno_id));

-- Vinculos escola <-> professor (criados so por convite; podem ser desfeitos)
create policy "escola e professor veem o vinculo" on public.escola_professores for select to authenticated
  using (professor_id = (select auth.uid()) or public.eh_responsavel_da_escola(escola_id));
create policy "escola ou professor desfaz o vinculo" on public.escola_professores for delete to authenticated
  using (professor_id = (select auth.uid()) or public.eh_responsavel_da_escola(escola_id));

-- Vinculos familia <-> aluno (criados so por convite)
create policy "familia e professor veem o vinculo" on public.aluno_familias for select to authenticated
  using (familia_id = (select auth.uid()) or public.eh_professor_do_aluno(aluno_id));
create policy "professor remove o acesso da familia" on public.aluno_familias for delete to authenticated
  using (public.eh_professor_do_aluno(aluno_id));

-- Convites
create policy "quem criou ve os convites" on public.convites for select to authenticated
  using (criado_por = (select auth.uid()));
create policy "criar convite permitido" on public.convites for insert to authenticated
  with check (
    criado_por = (select auth.uid())
    and usado_em is null
    and (
      (tipo = 'familia' and (public.eh_professor_do_aluno(aluno_id) or public.eh_escola_do_aluno(aluno_id)))
      or (tipo = 'professor' and public.eh_responsavel_da_escola(escola_id))
    )
  );
create policy "quem criou cancela o convite" on public.convites for delete to authenticated
  using (criado_por = (select auth.uid()));

-- Observacoes
create policy "professor ve todas as observacoes dos seus alunos" on public.observacoes for select to authenticated
  using (public.eh_professor_do_aluno(aluno_id));
create policy "professor registra observacao da escola" on public.observacoes for insert to authenticated
  with check (autor_id = (select auth.uid()) and origem = 'escola' and public.eh_professor_do_aluno(aluno_id));
create policy "professor edita as proprias observacoes" on public.observacoes for update to authenticated
  using (autor_id = (select auth.uid()) and origem = 'escola')
  with check (autor_id = (select auth.uid()) and origem = 'escola' and public.eh_professor_do_aluno(aluno_id));
create policy "familia ve as compartilhadas e as proprias" on public.observacoes for select to authenticated
  using (
    public.eh_familia_do_aluno(aluno_id)
    and ((origem = 'escola' and visivel_familia) or autor_id = (select auth.uid()))
  );
create policy "familia registra observacao de casa" on public.observacoes for insert to authenticated
  with check (
    autor_id = (select auth.uid()) and origem = 'casa' and not visivel_familia
    and public.eh_familia_do_aluno(aluno_id)
  );
create policy "familia edita as proprias observacoes" on public.observacoes for update to authenticated
  using (autor_id = (select auth.uid()) and origem = 'casa')
  with check (
    autor_id = (select auth.uid()) and origem = 'casa' and not visivel_familia
    and public.eh_familia_do_aluno(aluno_id)
  );
create policy "autor apaga a propria observacao" on public.observacoes for delete to authenticated
  using (autor_id = (select auth.uid()));

-- Atividades
create policy "professor gerencia as proprias atividades" on public.atividades for all to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()) and public.eh_professor_do_aluno(aluno_id));
create policy "familia ve atividades compartilhadas" on public.atividades for select to authenticated
  using (compartilhado_com_familia and status = 'revisado' and public.eh_familia_do_aluno(aluno_id));
create policy "escola ve atividades revisadas" on public.atividades for select to authenticated
  using (status = 'revisado' and public.eh_escola_do_professor(professor_id));

-- Relatorios. A familia NAO tem policy aqui: ela le pela funcao
-- relatorios_para_familia(), que devolve so a versao_familia.
create policy "professor gerencia os proprios relatorios" on public.relatorios for all to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()) and public.eh_professor_do_aluno(aluno_id));
create policy "escola ve relatorios revisados" on public.relatorios for select to authenticated
  using (status = 'revisado' and public.eh_escola_do_professor(professor_id));

-- Reforco
create policy "familia gerencia o proprio reforco" on public.reforcos for all to authenticated
  using (familia_id = (select auth.uid()) and public.eh_familia_do_aluno(aluno_id))
  with check (familia_id = (select auth.uid()) and public.eh_familia_do_aluno(aluno_id));
create policy "professor acompanha o reforco de casa" on public.reforcos for select to authenticated
  using (public.eh_professor_do_aluno(aluno_id));

-- Campos editaveis. Primeiro bloqueia a edicao da tabela inteira, depois
-- libera so as colunas que podem mudar (de quem e o aluno, quem escreveu,
-- datas de criacao etc. nunca mudam).
revoke update on public.alunos, public.alunos_saude, public.observacoes,
  public.atividades, public.relatorios, public.reforcos,
  public.aluno_familias, public.escola_professores, public.convites
  from anon, authenticated;
grant update (nome, data_nascimento, ano_escolar, interesses, pontos_fortes,
  o_que_funciona, o_que_trava, comunicacao, sensorial) on public.alunos to authenticated;
grant update (informacoes) on public.alunos_saude to authenticated;
grant update (texto, data_observacao, visivel_familia) on public.observacoes to authenticated;
grant update (titulo, conteudo_adaptado, status, compartilhado_com_familia) on public.atividades to authenticated;
grant update (periodo_inicio, periodo_fim, versao_familia, versao_tecnica, status,
  compartilhado_com_familia) on public.relatorios to authenticated;
grant update (resposta) on public.reforcos to authenticated;
-- Vinculos so sao criados por convite (pelas funcoes abaixo), nunca direto
revoke insert on public.aluno_familias, public.escola_professores from anon, authenticated;
revoke all on all tables in schema public from anon;

-- ============================================================
-- 5. Funcoes chamadas pelo app
-- ============================================================

-- Relatorios para a familia: so a versao acolhedora, nunca a tecnica
create function public.relatorios_para_familia(p_aluno uuid)
returns table (id uuid, periodo_inicio date, periodo_fim date, versao_familia text, atualizado_em timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.periodo_inicio, r.periodo_fim, r.versao_familia, r.atualizado_em
  from public.relatorios r
  where r.aluno_id = p_aluno
    and r.status = 'revisado' and r.compartilhado_com_familia
    and public.eh_familia_do_aluno(p_aluno)
  order by r.periodo_fim desc;
$$;

-- Familia registra o consentimento LGPD para um filho
create function public.registrar_consentimento(p_aluno uuid)
returns void language sql security definer set search_path = '' as $$
  update public.aluno_familias
  set consentimento_em = now()
  where aluno_id = p_aluno and familia_id = (select auth.uid()) and consentimento_em is null;
$$;

-- Aceitar convite estando logado (familia com conta que ganhou outro filho,
-- ou professor entrando numa escola). O e-mail precisa ser o do convite.
create function public.aceitar_convite(p_token uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  c public.convites;
  meu_email text := lower((select auth.jwt() ->> 'email'));
  meu_tipo public.tipo_perfil;
begin
  select * into c from public.convites
  where token = p_token and usado_em is null and expira_em > now()
  for update;
  if not found then
    raise exception 'convite_invalido';
  end if;
  if c.email <> meu_email then
    raise exception 'convite_de_outro_email';
  end if;

  select tipo into meu_tipo from public.perfis where id = (select auth.uid());
  if c.tipo = 'familia' and meu_tipo = 'familia' then
    insert into public.aluno_familias (aluno_id, familia_id, parentesco)
    values (c.aluno_id, (select auth.uid()), c.parentesco)
    on conflict do nothing;
  elsif c.tipo = 'professor' and meu_tipo = 'professor' then
    insert into public.escola_professores (escola_id, professor_id)
    values (c.escola_id, (select auth.uid()))
    on conflict do nothing;
  else
    raise exception 'convite_para_outro_perfil';
  end if;

  update public.convites set usado_em = now() where id = c.id;
  return c.tipo;
end;
$$;

-- Funcoes de permissao nao precisam ser chamadas por visitantes deslogados
revoke execute on all functions in schema public from anon, public;
grant execute on function
  public.relatorios_para_familia(uuid),
  public.registrar_consentimento(uuid),
  public.aceitar_convite(uuid)
to authenticated;

-- ============================================================
-- 6. Cadastro de familia por convite (atualiza a funcao do arquivo 0001)
-- ============================================================
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dados jsonb := new.raw_user_meta_data;
  tipo_pedido text := dados ->> 'tipo';
  nome_pedido text := left(trim(coalesce(dados ->> 'nome', '')), 120);
  c public.convites;
begin
  -- Familia: so com um convite valido, para o mesmo e-mail do cadastro
  if tipo_pedido = 'familia' then
    select * into c from public.convites
    where token::text = dados ->> 'convite'
      and tipo = 'familia' and usado_em is null and expira_em > now()
      and email = lower(new.email)
    for update;
    if not found then
      raise exception 'convite_invalido';
    end if;

    insert into public.perfis (id, tipo, nome) values (new.id, 'familia', nome_pedido);
    insert into public.aluno_familias (aluno_id, familia_id, parentesco)
    values (c.aluno_id, new.id, c.parentesco);
    update public.convites set usado_em = now() where id = c.id;
    return new;
  end if;

  -- Pelo cadastro publico: professor ou escola
  if tipo_pedido is distinct from 'escola' then
    tipo_pedido := 'professor';
  end if;

  insert into public.perfis (id, tipo, nome)
  values (new.id, tipo_pedido::public.tipo_perfil, nome_pedido);

  if tipo_pedido = 'professor' then
    insert into public.professores (id, escola_nome, rede, etapas, atuacao)
    values (
      new.id,
      left(trim(coalesce(dados ->> 'escola', '')), 160),
      dados ->> 'rede',
      array(select jsonb_array_elements_text(coalesce(dados -> 'etapas', '[]'::jsonb))),
      dados ->> 'atuacao'
    );
  else
    insert into public.escolas (nome, responsavel_id, cargo_responsavel)
    values (
      left(trim(coalesce(dados ->> 'escola', '')), 160),
      new.id,
      dados ->> 'cargo'
    );
  end if;

  return new;
end;
$$;

-- ============================================================
-- 7. Arquivos (Storage): buckets privados, uma pasta por usuario.
-- Caminho dos arquivos: {id do usuario}/{nome do arquivo}
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('atividades', 'atividades', false, 10485760, array['application/pdf']),
  ('licoes', 'licoes', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

create policy "cada usuario ve os proprios arquivos" on storage.objects for select to authenticated
  using (bucket_id in ('atividades', 'licoes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "cada usuario envia para a propria pasta" on storage.objects for insert to authenticated
  with check (bucket_id in ('atividades', 'licoes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "cada usuario apaga os proprios arquivos" on storage.objects for delete to authenticated
  using (bucket_id in ('atividades', 'licoes') and (storage.foldername(name))[1] = (select auth.uid())::text);
