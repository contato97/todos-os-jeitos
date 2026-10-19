-- Painel da escola: CONTAGENS por professor e por aluno.
-- A escola nao le observacoes nem vinculos de familia (RLS); estas funcoes
-- devolvem so numeros e "sim/nao", nunca o conteudo. So para a escola
-- responsavel e so dos professores vinculados a ela.

create function public.resumo_escola_professores()
returns table (
  professor_id uuid,
  alunos integer,
  atividades_revisadas integer,
  atividades_30d integer,
  relatorios_revisados integer,
  observacoes_30d integer,
  familias_conectadas integer,
  ultima_atividade timestamptz
)
language sql stable security definer set search_path = '' as $$
  select
    ep.professor_id,
    (select count(*) from public.alunos a where a.professor_id = ep.professor_id)::int,
    (select count(*) from public.atividades t where t.professor_id = ep.professor_id and t.status = 'revisado')::int,
    (select count(*) from public.atividades t where t.professor_id = ep.professor_id and t.status = 'revisado'
       and t.atualizado_em > now() - interval '30 days')::int,
    (select count(*) from public.relatorios r where r.professor_id = ep.professor_id and r.status = 'revisado')::int,
    (select count(*) from public.observacoes o join public.alunos a on a.id = o.aluno_id
       where a.professor_id = ep.professor_id and o.data_observacao > current_date - 30)::int,
    (select count(distinct af.aluno_id) from public.aluno_familias af join public.alunos a on a.id = af.aluno_id
       where a.professor_id = ep.professor_id and af.consentimento_em is not null)::int,
    (select max(t.atualizado_em) from public.atividades t where t.professor_id = ep.professor_id and t.status = 'revisado')
  from public.escola_professores ep
  where privado.eh_responsavel_da_escola(ep.escola_id);
$$;

create function public.resumo_escola_alunos()
returns table (
  aluno_id uuid,
  familia_conectada boolean,
  atividades_revisadas integer,
  observacoes_30d integer,
  ultima_observacao date
)
language sql stable security definer set search_path = '' as $$
  select
    a.id,
    exists (select 1 from public.aluno_familias af where af.aluno_id = a.id and af.consentimento_em is not null),
    (select count(*) from public.atividades t where t.aluno_id = a.id and t.status = 'revisado')::int,
    (select count(*) from public.observacoes o where o.aluno_id = a.id and o.data_observacao > current_date - 30)::int,
    (select max(o.data_observacao) from public.observacoes o where o.aluno_id = a.id)
  from public.alunos a
  where privado.eh_escola_do_professor(a.professor_id);
$$;

revoke execute on function public.resumo_escola_professores(), public.resumo_escola_alunos() from public, anon;
grant execute on function public.resumo_escola_professores(), public.resumo_escola_alunos() to authenticated;
