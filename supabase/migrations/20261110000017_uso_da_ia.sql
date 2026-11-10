-- Registro de cada uso da IA: quantos tokens gastou, quanto custou (em dolar,
-- moeda em que a Anthropic cobra) e quantos creditos contou para o usuario.
-- Serve para (1) fechar os precos dos planos com numeros reais e (2) contar
-- os creditos do mes de cada pessoa. NAO guarda o texto enviado nem a resposta.
create table public.ia_uso (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  acao text not null check (acao in ('adaptar', 'relatorio', 'reforco')),
  modelo text not null check (char_length(modelo) <= 80),
  sucesso boolean not null,
  paginas int not null default 0 check (paginas between 0 and 1000),
  creditos int not null default 0 check (creditos between 0 and 100),
  tokens_entrada int not null default 0 check (tokens_entrada >= 0),
  tokens_saida int not null default 0 check (tokens_saida >= 0),
  tokens_cache_leitura int not null default 0 check (tokens_cache_leitura >= 0),
  tokens_cache_escrita int not null default 0 check (tokens_cache_escrita >= 0),
  custo_usd numeric(10, 6),
  created_at timestamptz not null default now()
);
create index on public.ia_uso (usuario_id, created_at desc);

alter table public.ia_uso enable row level security;

-- Cada um registra e ve so o proprio uso. Ninguem edita nem apaga
-- (senao daria para "devolver" creditos ja usados).
create policy "registra o proprio uso" on public.ia_uso for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "ve o proprio uso" on public.ia_uso for select to authenticated
  using (usuario_id = (select auth.uid()));

revoke all on public.ia_uso from anon;
revoke update, delete on public.ia_uso from authenticated;

-- Resumo por mes e por acao, para a equipe consultar no SQL Editor do Supabase
-- (esquema privado: nao fica exposto na API do site)
create view privado.ia_custo_mensal as
  select
    date_trunc('month', created_at)::date as mes,
    acao,
    modelo,
    count(*) as usos,
    count(*) filter (where not sucesso) as falhas,
    round(avg(paginas), 1) as paginas_media,
    round(avg(tokens_entrada)) as entrada_media,
    round(avg(tokens_saida)) as saida_media,
    round(avg(custo_usd), 4) as custo_medio_usd,
    round(max(custo_usd), 4) as custo_maximo_usd,
    round(sum(custo_usd), 2) as custo_total_usd,
    count(distinct usuario_id) as pessoas
  from public.ia_uso
  group by 1, 2, 3;

revoke all on privado.ia_custo_mensal from public, anon, authenticated;
