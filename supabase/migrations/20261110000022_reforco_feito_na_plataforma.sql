-- Feedback da Juliana: as atividades da assistente de reforco ficam salvas e
-- a crianca pode fazer direto na plataforma (com um adulto por perto). Isso
-- alimenta o portfolio do fim do ano.

create table public.reforco_realizacoes (
  id uuid primary key default gen_random_uuid(),
  reforco_id uuid not null unique references public.reforcos (id) on delete cascade,
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  familia_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  -- Respostas da crianca, na ordem dos espacos "______" do material
  respostas jsonb not null default '[]' check (jsonb_typeof(respostas) = 'array' and pg_column_size(respostas) <= 20000),
  -- Como foi, marcado pelo adulto
  como_foi text check (como_foi in ('facil', 'medio', 'dificil')),
  observacao text check (char_length(observacao) <= 2000),
  feita_em timestamptz not null default now()
);
create index on public.reforco_realizacoes (aluno_id, feita_em desc);

alter table public.reforco_realizacoes enable row level security;

-- A familia registra a realizacao dos PROPRIOS pedidos de reforco
create policy "familia cuida das proprias realizacoes" on public.reforco_realizacoes for all to authenticated
  using (familia_id = (select auth.uid()) and privado.eh_familia_do_aluno(aluno_id))
  with check (
    familia_id = (select auth.uid())
    and privado.eh_familia_do_aluno(aluno_id)
    and exists (
      select 1 from public.reforcos r
      where r.id = reforco_id and r.aluno_id = reforco_realizacoes.aluno_id and r.familia_id = (select auth.uid())
    )
  );
-- O professor acompanha (e o portfolio vai usar)
create policy "professor ve as atividades feitas em casa" on public.reforco_realizacoes for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id));

revoke all on public.reforco_realizacoes from anon;
revoke update on public.reforco_realizacoes from authenticated;
grant update (respostas, como_foi, observacao, feita_em) on public.reforco_realizacoes to authenticated;
