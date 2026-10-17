-- Pagina de convite e e-mail de boas-vindas.

-- 1. Ver um convite pelo link, ANTES do login. Devolve so o minimo:
--    tipo, se ainda vale, o e-mail mascarado (para a pessoa saber qual usar)
--    e o primeiro nome do aluno / nome da escola. Quem nao tem o link
--    (um codigo aleatorio impossivel de adivinhar) nao consegue nada.
create function public.ver_convite(p_token uuid)
returns table (tipo text, valido boolean, email_dica text, aluno_primeiro_nome text, escola_nome text)
language sql stable security definer set search_path = '' as $$
  select
    c.tipo,
    (c.usado_em is null and c.expira_em > now()) as valido,
    left(c.email, 2) || '***' || substring(c.email from position('@' in c.email)) as email_dica,
    split_part(a.nome, ' ', 1) as aluno_primeiro_nome,
    e.nome as escola_nome
  from public.convites c
  left join public.alunos a on a.id = c.aluno_id
  left join public.escolas e on e.id = c.escola_id
  where c.token = p_token;
$$;

revoke execute on function public.ver_convite(uuid) from public;
grant execute on function public.ver_convite(uuid) to anon, authenticated;

-- 2. Boas-vindas: marca o envio uma unica vez por pessoa.
--    Devolve true so na primeira chamada (quando o e-mail deve sair).
alter table public.perfis add column boas_vindas_em timestamptz;

create function public.marcar_boas_vindas()
returns boolean language sql security definer set search_path = '' as $$
  with marcado as (
    update public.perfis set boas_vindas_em = now()
    where id = (select auth.uid()) and boas_vindas_em is null
    returning 1
  )
  select exists (select 1 from marcado);
$$;

revoke execute on function public.marcar_boas_vindas() from public, anon;
grant execute on function public.marcar_boas_vindas() to authenticated;
