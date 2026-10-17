-- Move as funcoes de permissao para um esquema "privado", que a API do Supabase
-- nao expoe. As regras (policies) continuam usando as funcoes normalmente,
-- mas ninguem consegue chama-las direto pela internet (/rest/v1/rpc/...).
-- Correcao sugerida pelo Security Advisor do Supabase.

create schema if not exists privado;
grant usage on schema privado to authenticated;

alter function public.eh_professor_do_aluno(uuid) set schema privado;
alter function public.eh_familia_do_aluno(uuid) set schema privado;
alter function public.eh_escola_do_professor(uuid) set schema privado;
alter function public.eh_escola_do_aluno(uuid) set schema privado;
alter function public.eh_responsavel_da_escola(uuid) set schema privado;
alter function public.professor_pertence_a_escola(uuid) set schema privado;
alter function public.pode_ver_perfil(uuid) set schema privado;

-- Funcoes que chamam outras funcoes precisam apontar para o novo endereco
create or replace function privado.eh_escola_do_aluno(p_aluno uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.alunos a
    where a.id = p_aluno and privado.eh_escola_do_professor(a.professor_id)
  );
$$;

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
    );
$$;

create or replace function public.relatorios_para_familia(p_aluno uuid)
returns table (id uuid, periodo_inicio date, periodo_fim date, versao_familia text, atualizado_em timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.periodo_inicio, r.periodo_fim, r.versao_familia, r.atualizado_em
  from public.relatorios r
  where r.aluno_id = p_aluno
    and r.status = 'revisado' and r.compartilhado_com_familia
    and privado.eh_familia_do_aluno(p_aluno)
  order by r.periodo_fim desc;
$$;

-- As policies precisam executar as funcoes; visitantes deslogados nao
revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;

-- Funcoes de gatilho (triggers) nunca devem ser chamadas direto
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;
revoke execute on function public.marcar_atualizacao() from public, anon, authenticated;
