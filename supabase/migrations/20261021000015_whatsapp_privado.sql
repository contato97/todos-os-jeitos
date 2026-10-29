-- O WhatsApp e dado pessoal: quem ve o nome de alguem (ex.: a familia ve o
-- nome do professor) NAO deve ver o telefone. Libera a leitura so das colunas
-- publicas de perfis; o proprio numero e lido pela funcao meu_whatsapp().
revoke select on public.perfis from anon, authenticated;
grant select (id, tipo, nome, foto, created_at, boas_vindas_em) on public.perfis to authenticated;

create function public.meu_whatsapp()
returns text language sql stable security definer set search_path = '' as $$
  select whatsapp from public.perfis where id = (select auth.uid());
$$;

revoke execute on function public.meu_whatsapp() from public, anon;
grant execute on function public.meu_whatsapp() to authenticated;
