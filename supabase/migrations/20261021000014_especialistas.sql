-- Perfil Especialista (feedback da Juliana, 2026-10-21)
-- - so entra pelo convite da escola (coordenacao/direcao)
-- - a escola escolhe QUAIS alunos ele acompanha e O QUE pode fazer
--   (ver relatorios revisados / registrar informacoes)
-- - registra orientacoes (todos os envolvidos veem) e informacoes clinicas,
--   como medicacao e receitas (so professor e familia veem; a escola nao)
-- - nada do especialista vai para a IA

-- ============================================================
-- 1. Tabelas
-- ============================================================
create table public.especialistas (
  id uuid primary key references public.perfis (id) on delete cascade,
  profissao text not null check (profissao in (
    'psicologo', 'psicopedagogo', 'neuropsicopedagogo', 'neuropsicologo', 'terapeuta_ocupacional',
    'fonoaudiologo', 'neuropediatra', 'psiquiatra', 'fisioterapeuta', 'outro'
  )),
  registro text check (char_length(registro) <= 60),   -- CRM, CRP, CREFITO... quando houver
  clinica text not null check (char_length(clinica) between 1 and 160),
  local text not null check (char_length(local) between 1 and 160),
  atuacao text not null check (char_length(atuacao) between 1 and 300)
);

create table public.escola_especialistas (
  escola_id uuid not null references public.escolas (id) on delete cascade,
  especialista_id uuid not null references public.especialistas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (escola_id, especialista_id)
);

-- Quais alunos cada especialista acompanha, e com quais permissoes.
-- Se a escola desvincula o especialista, os acompanhamentos caem juntos.
create table public.especialista_alunos (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  especialista_id uuid not null,
  escola_id uuid not null,
  ver_relatorios boolean not null default true,
  pode_registrar boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (aluno_id, especialista_id),
  foreign key (escola_id, especialista_id)
    references public.escola_especialistas (escola_id, especialista_id) on delete cascade
);
create index on public.especialista_alunos (especialista_id);
create index on public.especialista_alunos (escola_id);

create table public.especialista_registros (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  especialista_id uuid not null default auth.uid() references public.especialistas (id) on delete cascade,
  -- orientacao: estrategias e observacoes (professor, familia e escola veem)
  -- clinico: medicacao, receitas, informacoes de saude (so professor e familia)
  tipo text not null check (tipo in ('orientacao', 'clinico')),
  texto text not null check (char_length(texto) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index on public.especialista_registros (aluno_id, created_at desc);

-- Convite agora tambem pode ser para especialista (sempre de uma escola)
alter table public.convites drop constraint convites_tipo_check;
alter table public.convites drop constraint convites_check;
alter table public.convites add constraint convites_tipo_check
  check (tipo in ('familia', 'professor', 'especialista'));
alter table public.convites add constraint convites_check check (
  (tipo = 'familia' and aluno_id is not null and escola_id is null)
  or (tipo in ('professor', 'especialista') and escola_id is not null and aluno_id is null)
);

-- ============================================================
-- 2. Funcoes de permissao (esquema privado, fora da API)
-- ============================================================

-- O especialista logado acompanha este aluno? Com qual permissao?
-- Tambem confere que o professor do aluno ainda esta na escola que fez o vinculo.
create function privado.especialista_ve_aluno(p_aluno uuid, p_permissao text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.especialista_alunos ea
    join public.alunos a on a.id = ea.aluno_id
    join public.escola_professores ep on ep.professor_id = a.professor_id and ep.escola_id = ea.escola_id
    where ea.aluno_id = p_aluno and ea.especialista_id = (select auth.uid())
      and (p_permissao is null
        or (p_permissao = 'relatorios' and ea.ver_relatorios)
        or (p_permissao = 'registrar' and ea.pode_registrar))
  );
$$;

-- O aluno e de um professor desta escola? (para a escola criar o vinculo)
create function privado.aluno_da_escola(p_aluno uuid, p_escola uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.alunos a
    join public.escola_professores ep on ep.professor_id = a.professor_id
    where a.id = p_aluno and ep.escola_id = p_escola
  );
$$;

-- O usuario logado e o responsavel por uma escola que tem este especialista?
create function privado.eh_escola_do_especialista(p_especialista uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.escola_especialistas ee
    join public.escolas e on e.id = ee.escola_id
    where ee.especialista_id = p_especialista and e.responsavel_id = (select auth.uid())
  );
$$;

create function privado.especialista_pertence_a_escola(p_escola uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.escola_especialistas
    where escola_id = p_escola and especialista_id = (select auth.uid())
  );
$$;

-- Professor ou familia de um aluno que este especialista acompanha
create function privado.conhece_especialista(p_especialista uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.especialista_alunos ea
    join public.alunos a on a.id = ea.aluno_id
    where ea.especialista_id = p_especialista
      and (a.professor_id = (select auth.uid()) or privado.eh_familia_do_aluno(a.id))
  );
$$;

-- Quem pode ver o nome de quem (amplia a versao do arquivo 0003)
create or replace function privado.pode_ver_perfil(p_perfil uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select
    privado.eh_escola_do_professor(p_perfil)
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
    )
    -- escola, professor e familia -> especialistas que acompanham seus alunos
    or privado.eh_escola_do_especialista(p_perfil)
    or privado.conhece_especialista(p_perfil)
    or exists ( -- especialista -> professores dos alunos que acompanha
      select 1 from public.especialista_alunos ea
      join public.alunos a on a.id = ea.aluno_id
      where ea.especialista_id = (select auth.uid()) and a.professor_id = p_perfil
    )
    or exists ( -- especialista -> responsavel das escolas em que esta
      select 1 from public.escolas e
      where e.responsavel_id = p_perfil and privado.especialista_pertence_a_escola(e.id)
    );
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;

-- ============================================================
-- 3. Row Level Security
-- ============================================================
alter table public.especialistas enable row level security;
alter table public.escola_especialistas enable row level security;
alter table public.especialista_alunos enable row level security;
alter table public.especialista_registros enable row level security;

-- Dados profissionais
create policy "especialista ve os proprios dados" on public.especialistas for select to authenticated
  using (id = (select auth.uid()));
create policy "especialista edita os proprios dados" on public.especialistas for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "escola ve seus especialistas" on public.especialistas for select to authenticated
  using (privado.eh_escola_do_especialista(id));
create policy "professor e familia veem quem acompanha o aluno" on public.especialistas for select to authenticated
  using (privado.conhece_especialista(id));

-- Vinculo escola <-> especialista (criado so pelo convite)
create policy "escola e especialista veem o vinculo" on public.escola_especialistas for select to authenticated
  using (especialista_id = (select auth.uid()) or privado.eh_responsavel_da_escola(escola_id));
create policy "escola ou especialista desfaz o vinculo" on public.escola_especialistas for delete to authenticated
  using (especialista_id = (select auth.uid()) or privado.eh_responsavel_da_escola(escola_id));

-- Quais alunos o especialista acompanha: a escola decide
create policy "escola gerencia os acompanhamentos" on public.especialista_alunos for all to authenticated
  using (privado.eh_responsavel_da_escola(escola_id))
  with check (privado.eh_responsavel_da_escola(escola_id) and privado.aluno_da_escola(aluno_id, escola_id));
create policy "especialista ve os proprios acompanhamentos" on public.especialista_alunos for select to authenticated
  using (especialista_id = (select auth.uid()));
create policy "professor e familia veem quem acompanha" on public.especialista_alunos for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id) or privado.eh_familia_do_aluno(aluno_id));

-- Registros do especialista
create policy "especialista registra se tiver permissao" on public.especialista_registros for insert to authenticated
  with check (especialista_id = (select auth.uid()) and privado.especialista_ve_aluno(aluno_id, 'registrar'));
create policy "especialista ve os proprios registros" on public.especialista_registros for select to authenticated
  using (especialista_id = (select auth.uid()));
create policy "especialista apaga os proprios registros" on public.especialista_registros for delete to authenticated
  using (especialista_id = (select auth.uid()));
create policy "professor e familia veem os registros" on public.especialista_registros for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id) or privado.eh_familia_do_aluno(aluno_id));
create policy "escola ve so as orientacoes" on public.especialista_registros for select to authenticated
  using (tipo = 'orientacao' and privado.eh_escola_do_aluno(aluno_id));

-- O que o especialista le das tabelas que ja existiam
create policy "especialista ve os alunos que acompanha" on public.alunos for select to authenticated
  using (privado.especialista_ve_aluno(id));
create policy "especialista ve relatorios revisados" on public.relatorios for select to authenticated
  using (status = 'revisado' and privado.especialista_ve_aluno(aluno_id, 'relatorios'));
create policy "especialista ve as escolas em que esta" on public.escolas for select to authenticated
  using (privado.especialista_pertence_a_escola(id));

-- Convites: a escola tambem convida especialistas
drop policy "criar convite permitido" on public.convites;
create policy "criar convite permitido" on public.convites for insert to authenticated
  with check (
    criado_por = (select auth.uid())
    and usado_em is null
    and (
      (tipo = 'familia' and (privado.eh_professor_do_aluno(aluno_id) or privado.eh_escola_do_aluno(aluno_id)))
      or (tipo in ('professor', 'especialista') and privado.eh_responsavel_da_escola(escola_id))
    )
  );

-- Permissoes de coluna: so o que pode mudar
revoke all on public.especialistas, public.escola_especialistas, public.especialista_alunos,
  public.especialista_registros from anon;
revoke insert, update on public.especialistas from authenticated;
grant update (profissao, registro, clinica, local, atuacao) on public.especialistas to authenticated;
revoke insert, update on public.escola_especialistas from authenticated;
revoke update on public.especialista_alunos from authenticated;
grant update (ver_relatorios, pode_registrar) on public.especialista_alunos to authenticated;
revoke update on public.especialista_registros from authenticated;

-- ============================================================
-- 4. Convite aceito estando logado (agora tambem especialista)
-- ============================================================
create or replace function public.aceitar_convite(p_token uuid)
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
  elsif c.tipo = 'especialista' and meu_tipo::text = 'especialista' then
    insert into public.escola_especialistas (escola_id, especialista_id)
    values (c.escola_id, (select auth.uid()))
    on conflict do nothing;
  else
    raise exception 'convite_para_outro_perfil';
  end if;

  update public.convites set usado_em = now() where id = c.id;
  return c.tipo;
end;
$$;

-- ============================================================
-- 5. Cadastro: especialista so pelo convite (como a familia)
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
  whatsapp_pedido text := nullif(regexp_replace(coalesce(dados ->> 'whatsapp', ''), '[^0-9]', '', 'g'), '');
  c public.convites;
begin
  -- Familia e especialista: so com um convite valido, para o mesmo e-mail do cadastro
  if tipo_pedido in ('familia', 'especialista') then
    select * into c from public.convites
    where token::text = dados ->> 'convite'
      and tipo = tipo_pedido and usado_em is null and expira_em > now()
      and email = lower(new.email)
    for update;
    if not found then
      raise exception 'convite_invalido';
    end if;

    insert into public.perfis (id, tipo, nome, whatsapp)
    values (new.id, tipo_pedido::public.tipo_perfil, nome_pedido, whatsapp_pedido);

    if tipo_pedido = 'familia' then
      insert into public.aluno_familias (aluno_id, familia_id, parentesco)
      values (c.aluno_id, new.id, c.parentesco);
    else
      insert into public.especialistas (id, profissao, registro, clinica, local, atuacao)
      values (
        new.id,
        dados ->> 'profissao',
        nullif(left(trim(coalesce(dados ->> 'registro', '')), 60), ''),
        left(trim(coalesce(dados ->> 'clinica', '')), 160),
        left(trim(coalesce(dados ->> 'local', '')), 160),
        left(trim(coalesce(dados ->> 'atuacao', '')), 300)
      );
      insert into public.escola_especialistas (escola_id, especialista_id) values (c.escola_id, new.id);
    end if;

    update public.convites set usado_em = now() where id = c.id;
    return new;
  end if;

  -- Pelo cadastro publico: professor ou escola
  if tipo_pedido is distinct from 'escola' then
    tipo_pedido := 'professor';
  end if;

  insert into public.perfis (id, tipo, nome, whatsapp)
  values (new.id, tipo_pedido::public.tipo_perfil, nome_pedido, whatsapp_pedido);

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
