import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PainelEscolaView } from "@/app/(app)/escola/painel-escola";
import { HistoricoFamilia } from "@/app/(app)/familia/filhos/[id]/historico-familia";
import { FormularioConsentimento } from "@/app/(app)/familia/formulario-consentimento";
import { FormularioReforco } from "@/app/(app)/familia/filhos/[id]/reforco/formulario-reforco";
import { BarraExportar } from "@/components/barra-exportar";
import { AreaComMenu } from "@/components/area/area-com-menu";
import { Navegacao } from "@/components/area/navegacao";
import { Avatar } from "@/components/avatar";
import { BotaoTema } from "@/components/botao-tema";
import { Logo } from "@/components/logo";
import { Cartao, TextoFormatado } from "@/components/ui";
import { diasAtras } from "@/lib/datas";

// So em desenvolvimento: vitrine das areas da FAMILIA e da ESCOLA com dados de
// exemplo, usando os mesmos componentes das paginas reais.

const ATIVIDADE = `# Somando com dinossauros

Hoje vamos **somar** usando os dinossauros!

## Exemplo
O T-Rex tem **3 ovos**. A mamãe trouxe mais **2 ovos**. 3 + 2 = **5 ovos**

## Agora é sua vez
1. O Tricerátops tem 4 folhas. Ganhou mais 3. Quantas folhas tem agora?
2. Havia 5 pegadas na areia. Apareceram mais 1. Quantas pegadas?

## Dicas para o professor
- Leia o enunciado em voz alta antes.`;

const REFORCO = `# Pizza das frações 🍕

## Para você, adulto
**Objetivo:** entender que metade e um quarto são partes iguais de um inteiro.

Separe: papel, lápis de cor e uma tesoura sem ponta.

1. Desenhe um círculo grande: é a pizza.
2. Peça para a Lia dividir a pizza para duas pessoas. Pergunte: “os pedaços ficaram do mesmo tamanho?”
3. Agora para quatro pessoas. Deixe ela recortar.

## Formas diferentes de ensinar
- **Visual:** pinte cada pedaço de uma cor.
- **Concreta:** use uma laranja ou um pão de verdade.
- **Com dinossauros:** quatro dinossauros dividindo uma folha gigante.

## Material para a criança
**Vamos dividir a pizza!**

1. Pinte **metade** da pizza de vermelho. 🍕
2. Em quantos pedaços a pizza foi cortada? ______
3. Se 4 dinossauros dividirem a pizza, cada um come ______ pedaço.

## Respostas (para o adulto)
2. Depende do desenho. 3. Um pedaço (um quarto).

## Se a criança se frustrar
- Faça uma pausa para um copo d'água e volte com a pizza de papel.
- Elogie a tentativa: “você dividiu certinho, agora vamos contar juntos”.`;

const RELATORIO = `## Como a Lia está indo

A Lia teve um mês de **muitas conquistas**! Ela está lendo frases curtas com mais segurança e participou das rodas de conversa.

## O que tem ajudado
- Instruções curtas, uma de cada vez
- Atividades com dinossauros (o assunto preferido dela!)
- Pausas rápidas para se movimentar

## Como apoiar em casa
- Leiam juntos 10 minutos por dia, deixando ela escolher o livro
- Elogiem o esforço, não só o acerto`;

function Cabecalho({ nome, papel }: { nome: string; papel: string }) {
  return (
    <header className="border-b border-marca/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <BotaoTema />
          <span className="flex items-center gap-2">
            <Avatar url={null} nome={nome} />
            <span className="hidden sm:inline">{nome.split(" ")[0]}</span>
          </span>
          <span className="rounded-full px-4 py-2 font-medium ring-2 ring-marca">
            Sair
          </span>
        </div>
      </div>
      <p className="sr-only">{papel}</p>
    </header>
  );
}

export default async function Vitrine() {
  if (process.env.NODE_ENV !== "development") notFound();
  // As datas de exemplo ("ha 2 dias") dependem do momento: renderiza a cada visita
  await connection();

  return (
    <div className="flex flex-col">
      <p className="sticky top-0 z-30 bg-mostarda px-4 py-2 text-center font-medium text-[#0e4357]">
        Vitrine com dados de exemplo. Os botões não salvam nada aqui.
      </p>

      {/* ======================= FAMILIA ======================= */}
      <section
        aria-label="Área da família"
        className="border-b-8 border-lavanda/40 pb-16"
      >
        <Cabecalho nome="Marina Souza" papel="Área da família" />
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-petroleo">
            Área da família
          </p>
          <AreaComMenu
            rotulo="Área da família (exemplo)"
            grupos={[
              [
                {
                  href: "/dev/vitrine",
                  rotulo: "Meus filhos",
                  icone: "filhos",
                  exato: true,
                },
              ],
              [
                {
                  href: "/familia/ajuda",
                  rotulo: "Central de ajuda",
                  icone: "ajuda",
                },
                {
                  href: "/familia/conta",
                  rotulo: "Minha conta",
                  icone: "conta",
                },
              ],
            ]}
          >
            <h1 className="text-3xl font-semibold">Olá, Marina!</h1>
            <p className="mt-1">
              Acompanhe o dia a dia de quem você ama, junto com a escola.
            </p>

            <h2 className="mt-8 text-xl font-semibold">
              1. Primeiro acesso: consentimento (LGPD)
            </h2>
            <Cartao className="mt-3 max-w-3xl border-l-4 border-mostarda">
              <FormularioConsentimento
                alunoId="00000000-0000-0000-0000-000000000000"
                nomeAluno="Lia"
              />
            </Cartao>

            <h2 className="mt-10 text-xl font-semibold">
              2. Depois do consentimento: o histórico da Lia
            </h2>
            <div className="mt-4">
              <h3 className="text-3xl font-semibold">Lia Souza</h3>
              <div className="mt-6">
                <Navegacao
                  rotulo="Seções da Lia (exemplo)"
                  itens={[
                    { href: "/dev/vitrine", rotulo: "Histórico", exato: true },
                    { href: "/familia/x/observacoes", rotulo: "Observações" },
                    {
                      href: "/familia/x/reforco",
                      rotulo: "Reforço e lição de casa",
                    },
                  ]}
                />
              </div>
              <div className="mt-8">
                <HistoricoFamilia
                  id="exemplo"
                  professorNome="Ana Paula Ribeiro"
                  abertos
                  relatorios={[
                    {
                      id: "r1",
                      periodo_inicio: diasAtras(30),
                      periodo_fim: diasAtras(1),
                      versao_familia: RELATORIO,
                    },
                  ]}
                  atividades={[
                    {
                      id: "a1",
                      titulo: "Somando com dinossauros",
                      conteudo_adaptado: ATIVIDADE,
                    },
                  ]}
                  observacoes={[
                    {
                      id: "o1",
                      data_observacao: diasAtras(2),
                      texto:
                        "Hoje a Lia leu a frase inteira sozinha! Vale elogiar em casa.",
                    },
                    {
                      id: "o2",
                      data_observacao: diasAtras(6),
                      texto:
                        "Participou da roda de conversa contando sobre o fim de semana.",
                    },
                  ]}
                />
              </div>
            </div>
          
            <h2 className="mt-12 text-xl font-semibold">3. Assistente de reforço</h2>
            <div className="mt-4 grid gap-6 xl:grid-cols-5">
              <Cartao className="h-fit xl:col-span-2">
                <h3 className="text-xl font-semibold">Assistente de reforço</h3>
                <p className="mb-5 mt-1">Escolha a matéria e o conteúdo: você recebe um passo a passo, jeitos diferentes de ensinar e um material pronto para a Lia.</p>
                <FormularioReforco alunoId="00000000-0000-0000-0000-000000000000" nomeCrianca="Lia" />
              </Cartao>
              <Cartao className="min-w-0 border-l-4 border-petroleo xl:col-span-3">
                <p className="text-sm font-semibold">Exemplo de resposta · Matemática · 20 min</p>
                <div className="mt-3">
                  <TextoFormatado texto={REFORCO} />
                </div>
                <div className="mt-6 max-w-md rounded-2xl bg-creme/60 p-4">
                  <h4 className="mb-3 font-semibold">Baixar ou copiar</h4>
                  <BarraExportar tipo="reforco" atividadeId="exemplo" titulo="Pizza das frações" texto={REFORCO} />
                </div>
              </Cartao>
            </div>
          </AreaComMenu>
        </main>
      </section>

      {/* ======================= ESCOLA ======================= */}
      <section aria-label="Área da escola">
        <Cabecalho nome="Carla Mendes" papel="Área da escola" />
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-petroleo">
            Área da escola
          </p>
          <AreaComMenu
            rotulo="Área da escola (exemplo)"
            grupos={[
              [
                {
                  href: "/dev/vitrine",
                  rotulo: "Visão geral",
                  icone: "painel",
                  exato: true,
                },
                {
                  href: "/escola/professores",
                  rotulo: "Professores",
                  icone: "professores",
                  destaque: true,
                },
                { href: "/escola/alunos", rotulo: "Alunos", icone: "alunos" },
              ],
              [
                {
                  href: "/escola/ajuda",
                  rotulo: "Central de ajuda",
                  icone: "ajuda",
                },
                {
                  href: "/escola/conta",
                  rotulo: "Minha conta",
                  icone: "conta",
                },
              ],
            ]}
          >
            <div>
              <PainelEscolaView
              escola={{ nome: "Escola Raio de Sol" }}
              professores={[
                { id: "p1", nome: "Ana Paula Ribeiro" },
                { id: "p2", nome: "Bruno Lima" },
                { id: "p3", nome: "Juliana Costa" },
              ]}
              resumo={[
                { professor_id: "p1", alunos: 2, atividades_revisadas: 6, atividades_30d: 3, relatorios_revisados: 2, observacoes_30d: 14, familias_conectadas: 2, ultima_atividade: new Date().toISOString() },
                { professor_id: "p2", alunos: 1, atividades_revisadas: 2, atividades_30d: 0, relatorios_revisados: 0, observacoes_30d: 3, familias_conectadas: 0, ultima_atividade: "2026-08-20T12:00:00Z" },
                { professor_id: "p3", alunos: 2, atividades_revisadas: 0, atividades_30d: 0, relatorios_revisados: 0, observacoes_30d: 5, familias_conectadas: 1, ultima_atividade: null },
              ]}
              resumoAlunos={[
                { aluno_id: "al1", familia_conectada: true, atividades_revisadas: 4 },
                { aluno_id: "al2", familia_conectada: true, atividades_revisadas: 2 },
                { aluno_id: "al3", familia_conectada: false, atividades_revisadas: 2 },
                { aluno_id: "al4", familia_conectada: true, atividades_revisadas: 0 },
                { aluno_id: "al5", familia_conectada: false, atividades_revisadas: 0 },
              ]}
              recentes={[
                { id: "t1", titulo: "Somando com dinossauros", aluno_id: "al1", professor_id: "p1", atualizado_em: new Date().toISOString() },
                { id: "t2", titulo: "Interpretação de texto", aluno_id: "al2", professor_id: "p1", atualizado_em: new Date().toISOString() },
                { id: "t3", titulo: "Leitura: o ciclo da água", aluno_id: "al3", professor_id: "p2", atualizado_em: "2026-08-20T12:00:00Z" },
              ]}
              nomesAlunos={{ al1: "Lia Souza", al2: "Pedro Alves", al3: "Theo Martins", al4: "Maria Clara", al5: "Davi Rocha" }}
              convitesPendentes={1}
            />
            </div>
          </AreaComMenu>
        </main>
      </section>
    </div>
  );
}
