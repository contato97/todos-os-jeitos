-- Etapa 2: perfis de usuario (professor, familia, escola), dados do professor e escolas.
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > colar > Run.

-- Tipos de perfil possiveis
create type public.tipo_perfil as enum ('professor', 'familia', 'escola');

-- Um perfil por usuario do Supabase Auth (comum a todos os tipos)
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  tipo public.tipo_perfil not null,
  nome text not null check (char_length(nome) between 1 and 120),
  created_at timestamptz not null default now()
);

-- Dados que so o professor tem
create table public.professores (
  id uuid primary key references public.perfis (id) on delete cascade,
  escola_nome text not null check (char_length(escola_nome) between 1 and 160),
  rede text not null check (rede in ('publica', 'privada')),
  -- Etapas em que leciona (pode ser mais de uma)
  etapas text[] not null check (
    cardinality(etapas) > 0
    and etapas <@ array['infantil', 'fundamental_1', 'fundamental_2', 'medio']
  ),
  -- polivalente = base comum (varias materias); especialista = uma materia
  atuacao text not null check (atuacao in ('polivalente', 'especialista'))
);

-- Escola: criada junto com a conta do responsavel pela escola
create table public.escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 160),
  responsavel_id uuid not null unique references public.perfis (id) on delete cascade,
  cargo_responsavel text not null check (
    cargo_responsavel in ('direcao', 'coordenacao', 'orientacao', 'outro')
  ),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security: o banco so entrega a linha se a regra deixar.
-- Sem uma policy, ninguem le nem escreve nada.
-- ============================================================
alter table public.perfis enable row level security;
alter table public.professores enable row level security;
alter table public.escolas enable row level security;

create policy "usuario ve o proprio perfil"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()));

create policy "usuario edita o proprio perfil"
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "professor ve os proprios dados"
  on public.professores for select to authenticated
  using (id = (select auth.uid()));

create policy "professor edita os proprios dados"
  on public.professores for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "responsavel ve a propria escola"
  on public.escolas for select to authenticated
  using (responsavel_id = (select auth.uid()));

create policy "responsavel edita a propria escola"
  on public.escolas for update to authenticated
  using (responsavel_id = (select auth.uid()))
  with check (responsavel_id = (select auth.uid()));

-- Ninguem pode trocar o proprio "tipo" (ex.: uma familia virar professor),
-- nem criar ou apagar linhas direto. So os campos abaixo sao editaveis.
revoke insert, update, delete on public.perfis from anon, authenticated;
grant update (nome) on public.perfis to authenticated;
revoke insert, update, delete on public.professores from anon, authenticated;
grant update (escola_nome, rede, etapas, atuacao) on public.professores to authenticated;
revoke insert, update, delete on public.escolas from anon, authenticated;
grant update (nome, cargo_responsavel) on public.escolas to authenticated;

-- ============================================================
-- Ao criar uma conta, o banco cria o perfil automaticamente com os
-- dados do formulario. "security definer" faz a funcao rodar com
-- permissao de dono, por isso ela consegue inserir mesmo com o insert
-- revogado acima. Se algum dado vier invalido, o cadastro e recusado.
-- ============================================================
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dados jsonb := new.raw_user_meta_data;
  tipo_pedido text := dados ->> 'tipo';
  nome_pedido text := left(trim(coalesce(dados ->> 'nome', '')), 120);
begin
  -- Pelo cadastro publico so da para ser professor ou escola.
  -- Familia entra apenas por convite do professor (etapa 8).
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

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();
