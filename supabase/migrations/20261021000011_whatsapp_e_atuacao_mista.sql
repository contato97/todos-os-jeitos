-- Feedback da Juliana (2026-10-21):
-- - WhatsApp no cadastro de todos os perfis
-- - professor pode trabalhar nas duas redes (publica e privada)
-- - professor pode atuar na base comum e tambem em uma materia

-- So digitos, com DDD (10 ou 11) e, opcionalmente, o 55 do Brasil na frente
alter table public.perfis
  add column whatsapp text check (whatsapp ~ '^[0-9]{10,13}$');
grant update (whatsapp) on public.perfis to authenticated;

alter table public.professores drop constraint professores_rede_check;
alter table public.professores
  add constraint professores_rede_check check (rede in ('publica', 'privada', 'ambas'));

alter table public.professores drop constraint professores_atuacao_check;
alter table public.professores
  add constraint professores_atuacao_check check (atuacao in ('polivalente', 'especialista', 'ambos'));

-- Gatilho de cadastro: agora grava tambem o WhatsApp
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dados jsonb := new.raw_user_meta_data;
  tipo_pedido text := dados ->> 'tipo';
  nome_pedido text := left(trim(coalesce(dados ->> 'nome', '')), 120);
  -- Digitos apenas; vazio vira null (a coluna e opcional para contas antigas)
  whatsapp_pedido text := nullif(regexp_replace(coalesce(dados ->> 'whatsapp', ''), '[^0-9]', '', 'g'), '');
  c public.convites;
begin
  -- Familia: so com um convite valido, para o mesmo e-mail do cadastro
  if tipo_pedido = 'familia' then
    select * into c from public.convites
    where token::text = dados ->> 'convite'
      and tipo = 'familia' and usado_em is null and expira_em > now()
      and email = lower(new.email)
    for update;
    if not found then
      raise exception 'convite_invalido';
    end if;

    insert into public.perfis (id, tipo, nome, whatsapp) values (new.id, 'familia', nome_pedido, whatsapp_pedido);
    insert into public.aluno_familias (aluno_id, familia_id, parentesco)
    values (c.aluno_id, new.id, c.parentesco);
    update public.convites set usado_em = now() where id = c.id;
    return new;
  end if;

  -- Pelo cadastro publico: professor ou escola
  if tipo_pedido is distinct from 'escola' then
    tipo_pedido := 'professor';
  end if;

  insert into public.perfis (id, tipo, nome, whatsapp)
  values (new.id, tipo_pedido::public.tipo_perfil, nome_pedido, whatsapp_pedido);

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
