-- Feedback da Juliana: aproveitar os laudos e relatorios de saude na adaptacao.
-- O laudo em si continua protegido (so o professor ve, nunca vai para a IA).
-- O professor escreve aqui um RESUMO PEDAGOGICO do que os laudos indicam para
-- a sala de aula (necessidades e estrategias, sem nomes de diagnostico). E so
-- este resumo que a IA recebe, junto com o resto do perfil e sem o nome do aluno.
alter table public.alunos
  add column resumo_laudos text check (char_length(resumo_laudos) <= 3000);
grant update (resumo_laudos) on public.alunos to authenticated;
