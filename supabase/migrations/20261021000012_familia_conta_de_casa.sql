-- Feedback da Juliana (2026-10-21):
-- - a familia tambem tem voz: conta como a crianca e em casa, rotina de
--   estudo, medicacoes e acompanhamentos (neuro, terapia ocupacional...)
-- - "dicas do professor para a familia" em cada atividade compartilhada

-- Uma ficha por responsavel e por crianca (pai e mae podem preencher cada um a sua)
create table public.aluno_casa (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  familia_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  como_em_casa text check (char_length(como_em_casa) <= 2000),   -- jeito em casa (agitado, calmo...)
  rotina_estudo text check (char_length(rotina_estudo) <= 2000), -- como faz as tarefas em casa
  -- Saude: so a propria familia e o professor do aluno veem. NUNCA vai para a IA.
  medicacoes text check (char_length(medicacoes) <= 2000),
  acompanhamentos text check (char_length(acompanhamentos) <= 2000),
  outras text check (char_length(outras) <= 2000),
  atualizado_em timestamptz not null default now(),
  primary key (aluno_id, familia_id)
);

alter table public.aluno_casa enable row level security;

create trigger atualizar_aluno_casa before update on public.aluno_casa
  for each row execute function public.marcar_atualizacao();

-- A familia (com consentimento) cuida da propria ficha
create policy "familia cuida do que conta de casa" on public.aluno_casa for all to authenticated
  using (familia_id = (select auth.uid()) and privado.eh_familia_do_aluno(aluno_id))
  with check (familia_id = (select auth.uid()) and privado.eh_familia_do_aluno(aluno_id));
-- O professor do aluno le. A escola NAO tem acesso (ha dados de saude).
create policy "professor le o que a familia contou" on public.aluno_casa for select to authenticated
  using (privado.eh_professor_do_aluno(aluno_id));

revoke all on public.aluno_casa from anon;
revoke update on public.aluno_casa from authenticated;
grant update (como_em_casa, rotina_estudo, medicacoes, acompanhamentos, outras)
  on public.aluno_casa to authenticated;

-- Dicas que o professor escreve PARA A FAMILIA (diferente das dicas para o
-- professor que a IA gera e que a familia nao ve)
alter table public.atividades
  add column dicas_familia text check (char_length(dicas_familia) <= 3000);
grant update (dicas_familia) on public.atividades to authenticated;
