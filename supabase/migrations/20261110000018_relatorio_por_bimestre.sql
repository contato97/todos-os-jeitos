-- Feedback da Juliana: relatorio da familia com cara de documento para levar
-- a uma consulta, com linha do tempo por bimestre, aprendizagem por materia
-- e o logo da escola.

-- 1. Relatorio ligado a um bimestre e ano letivo (opcional)
alter table public.relatorios
  add column bimestre smallint check (bimestre between 1 and 4),
  add column ano_letivo smallint check (ano_letivo between 2020 and 2100);
grant update (bimestre, ano_letivo) on public.relatorios to authenticated;

-- 2. Observacao com materia (opcional), para o relatorio organizar por materia
alter table public.observacoes
  add column materia text check (char_length(materia) <= 60);
grant update (materia) on public.observacoes to authenticated;

-- 3. Logo da escola. A escola envia o dela; o professor sem escola cadastrada
--    pode enviar o da escola onde trabalha. Logo nao e dado sensivel: o
--    bucket e publico para leitura, mas cada um so grava na propria pasta.
alter table public.escolas add column logo text check (char_length(logo) <= 300);
alter table public.professores add column logo text check (char_length(logo) <= 300);
grant update (logo) on public.escolas, public.professores to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 1048576, array['image/png', 'image/jpeg', 'image/webp']);

create policy "logos: ver os proprios" on storage.objects for select to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "logos: enviar para a propria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "logos: apagar os proprios" on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 4. Cabecalho dos documentos do aluno: logo e nome da escola.
--    Prioridade: a escola vinculada (com logo) e, se nao houver, o professor.
--    So responde para quem ja pode ver o aluno.
create function public.cabecalho_do_aluno(p_aluno uuid)
returns table (logo text, escola text)
language sql stable security definer set search_path = '' as $$
  select
    coalesce(e.logo, p.logo) as logo,
    coalesce(e.nome, p.escola_nome) as escola
  from public.alunos a
  join public.professores p on p.id = a.professor_id
  left join lateral (
    select es.logo, es.nome
    from public.escola_professores ep
    join public.escolas es on es.id = ep.escola_id
    where ep.professor_id = a.professor_id
    order by (es.logo is null), ep.created_at
    limit 1
  ) e on true
  where a.id = p_aluno
    and (privado.eh_professor_do_aluno(p_aluno) or privado.eh_familia_do_aluno(p_aluno)
      or privado.eh_escola_do_aluno(p_aluno) or privado.especialista_ve_aluno(p_aluno));
$$;

revoke execute on function public.cabecalho_do_aluno(uuid) from public, anon;
grant execute on function public.cabecalho_do_aluno(uuid) to authenticated;

-- 5. Relatorios para a familia agora trazem bimestre e ano letivo
--    (o formato de retorno muda, por isso a funcao e recriada)
drop function public.relatorios_para_familia(uuid);
create function public.relatorios_para_familia(p_aluno uuid)
returns table (
  id uuid, periodo_inicio date, periodo_fim date, versao_familia text,
  atualizado_em timestamptz, bimestre smallint, ano_letivo smallint
)
language sql stable security definer set search_path = '' as $$
  select r.id, r.periodo_inicio, r.periodo_fim, r.versao_familia, r.atualizado_em, r.bimestre, r.ano_letivo
  from public.relatorios r
  where r.aluno_id = p_aluno
    and r.status = 'revisado' and r.compartilhado_com_familia
    and privado.eh_familia_do_aluno(p_aluno)
  order by r.periodo_fim desc;
$$;

revoke execute on function public.relatorios_para_familia(uuid) from public, anon;
grant execute on function public.relatorios_para_familia(uuid) to authenticated;
