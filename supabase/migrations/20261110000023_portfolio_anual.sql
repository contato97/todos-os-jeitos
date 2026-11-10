-- Feedback da Juliana: portfolio anual de cada aluno, com acesso para escola,
-- professor, familia e especialista. Um relatorio no INICIO do ano (perfil de
-- entrada, com o que escola, familia, professor e especialista registraram)
-- e outro no FIM (trajetoria, evolucoes, o que continuar e o que mudar).
-- Fica guardado ano a ano, para o acompanhamento continuar nas series seguintes.

create table public.portfolio_relatorios (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  professor_id uuid not null default auth.uid() references public.professores (id) on delete cascade,
  ano_letivo smallint not null check (ano_letivo between 2020 and 2100),
  tipo text not null check (tipo in ('inicial', 'final')),
  conteudo text check (char_length(conteudo) <= 40000),
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado')),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (aluno_id, ano_letivo, tipo)
);
create index on public.portfolio_relatorios (aluno_id, ano_letivo);

create trigger atualizar_portfolio before update on public.portfolio_relatorios
  for each row execute function public.marcar_atualizacao();

alter table public.portfolio_relatorios enable row level security;

create policy "professor cuida do portfolio dos proprios alunos" on public.portfolio_relatorios for all to authenticated
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()) and privado.eh_professor_do_aluno(aluno_id));
-- Depois de revisado pelo professor, todos que acompanham o aluno veem
create policy "escola ve o portfolio revisado" on public.portfolio_relatorios for select to authenticated
  using (status = 'revisado' and privado.eh_escola_do_aluno(aluno_id));
create policy "familia ve o portfolio revisado" on public.portfolio_relatorios for select to authenticated
  using (status = 'revisado' and privado.eh_familia_do_aluno(aluno_id));
create policy "especialista ve o portfolio revisado" on public.portfolio_relatorios for select to authenticated
  using (status = 'revisado' and privado.especialista_ve_aluno(aluno_id, 'relatorios'));

revoke all on public.portfolio_relatorios from anon;
revoke update on public.portfolio_relatorios from authenticated;
grant update (conteudo, status) on public.portfolio_relatorios to authenticated;

-- O portfolio gerado pela IA conta 1 credito
alter table public.ia_uso drop constraint ia_uso_acao_check;
alter table public.ia_uso add constraint ia_uso_acao_check
  check (acao in ('adaptar', 'relatorio', 'reforco', 'moderacao', 'encaminhamento', 'portfolio'));
