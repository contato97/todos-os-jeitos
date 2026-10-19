-- Reforco especializado: novos tipos de pedido, materia, conteudo e tempo disponivel.

alter table public.reforcos drop constraint reforcos_tipo_check;
alter table public.reforcos add constraint reforcos_tipo_check
  check (tipo in ('reforco', 'licao', 'explicar', 'material'));

alter table public.reforcos add column materia text check (char_length(materia) <= 60);
alter table public.reforcos add column tema text check (char_length(tema) <= 200);
alter table public.reforcos add column tempo_minutos integer check (tempo_minutos between 5 and 60);
