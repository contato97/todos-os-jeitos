-- Feedback da Juliana: familia e professor conversam pela plataforma, e cada
-- recado e analisado ANTES de ser enviado, para nao haver ofensas de nenhuma
-- das partes.
--
-- Como garantimos que nada "fura" a revisao: ninguem grava direto na tabela.
-- So a funcao enviar_mensagem grava, e ela exige uma chave secreta que fica
-- apenas no servidor do site (variavel MODERACAO_CHAVE). O servidor so chama
-- a funcao depois que a mensagem passou pela revisao.

-- Segredos do banco: tabela no esquema privado, sem acesso para ninguem.
-- O VALOR da chave nao fica neste arquivo (ele vai para o GitHub): e gravado
-- direto no banco e na variavel de ambiente.
create table privado.segredos (
  nome text primary key,
  valor text not null
);
revoke all on privado.segredos from public, anon, authenticated;

-- Uma conversa por aluno: o professor do aluno e as familias conectadas
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  -- false quando a IA estava indisponivel e so o filtro basico revisou
  revisada_por_ia boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.mensagens (aluno_id, created_at);

alter table public.mensagens enable row level security;
create policy "professor e familia leem a conversa" on public.mensagens for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id) or privado.eh_familia_do_aluno(aluno_id));
-- Sem policy de insert/update/delete: so a funcao abaixo grava; nada e editado nem apagado
revoke all on public.mensagens from anon;
revoke insert, update, delete on public.mensagens from authenticated;

-- Ate quando cada pessoa ja leu a conversa de cada aluno (para mostrar "novas")
create table public.conversa_leituras (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  lida_em timestamptz not null default now(),
  primary key (aluno_id, usuario_id)
);
alter table public.conversa_leituras enable row level security;
create policy "cada um ve as proprias leituras" on public.conversa_leituras for select to authenticated
  using (usuario_id = (select auth.uid()));
revoke all on public.conversa_leituras from anon;
revoke insert, update, delete on public.conversa_leituras from authenticated;

create function public.enviar_mensagem(p_aluno uuid, p_texto text, p_chave text, p_revisada boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  nova uuid;
begin
  if p_chave is null or p_chave is distinct from (select valor from privado.segredos where nome = 'moderacao') then
    raise exception 'nao_autorizado';
  end if;
  if not (privado.eh_professor_do_aluno(p_aluno) or privado.eh_familia_do_aluno(p_aluno)) then
    raise exception 'sem_acesso';
  end if;

  insert into public.mensagens (aluno_id, autor_id, texto, revisada_por_ia)
  values (p_aluno, (select auth.uid()), trim(p_texto), coalesce(p_revisada, false))
  returning id into nova;

  -- Quem enviou ja "leu" ate aqui
  insert into public.conversa_leituras (aluno_id, usuario_id, lida_em)
  values (p_aluno, (select auth.uid()), now())
  on conflict (aluno_id, usuario_id) do update set lida_em = now();
  return nova;
end;
$$;

create function public.marcar_conversa_lida(p_aluno uuid)
returns void language sql security definer set search_path = '' as $$
  insert into public.conversa_leituras (aluno_id, usuario_id, lida_em)
  select p_aluno, (select auth.uid()), now()
  where privado.eh_professor_do_aluno(p_aluno) or privado.eh_familia_do_aluno(p_aluno)
  on conflict (aluno_id, usuario_id) do update set lida_em = now();
$$;

-- Quantas mensagens novas (de outras pessoas) ha em cada conversa do usuario
create function public.conversas_nao_lidas()
returns table (aluno_id uuid, nao_lidas int)
language sql stable security definer set search_path = '' as $$
  select m.aluno_id, count(*)::int
  from public.mensagens m
  left join public.conversa_leituras l on l.aluno_id = m.aluno_id and l.usuario_id = (select auth.uid())
  where m.autor_id <> (select auth.uid())
    and (l.lida_em is null or m.created_at > l.lida_em)
    and (privado.eh_professor_do_aluno(m.aluno_id) or privado.eh_familia_do_aluno(m.aluno_id))
  group by m.aluno_id;
$$;

revoke execute on function public.enviar_mensagem(uuid, text, text, boolean), public.marcar_conversa_lida(uuid),
  public.conversas_nao_lidas() from public, anon;
grant execute on function public.enviar_mensagem(uuid, text, text, boolean), public.marcar_conversa_lida(uuid),
  public.conversas_nao_lidas() to authenticated;

-- A revisao das mensagens tambem e registrada no custo da IA (sem gastar credito)
alter table public.ia_uso drop constraint ia_uso_acao_check;
alter table public.ia_uso add constraint ia_uso_acao_check
  check (acao in ('adaptar', 'relatorio', 'reforco', 'moderacao'));
