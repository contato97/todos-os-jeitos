-- Antes do consentimento a familia nao le a ficha do aluno (RLS).
-- Esta funcao devolve so o primeiro nome, para a tela de consentimento
-- dizer de qual crianca se trata.
create function public.consentimentos_pendentes()
returns table (aluno_id uuid, primeiro_nome text, parentesco text)
language sql stable security definer set search_path = '' as $$
  select af.aluno_id, split_part(a.nome, ' ', 1), af.parentesco
  from public.aluno_familias af
  join public.alunos a on a.id = af.aluno_id
  where af.familia_id = (select auth.uid()) and af.consentimento_em is null;
$$;

revoke execute on function public.consentimentos_pendentes() from public, anon;
grant execute on function public.consentimentos_pendentes() to authenticated;
