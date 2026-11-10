import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Documento } from "@/app/imprimir/documento";
import { LinhaDoTempoConteudo, ordenarRelatorios } from "@/app/imprimir/linha-do-tempo/linha";

// So em desenvolvimento: previa da linha do tempo com dados de exemplo
const BIMESTRE = (n: number, foco: string) => `## Como foi o período

A Lia chegou ao ${n}º bimestre mais segura e participativa. ${foco}

## Aprendizagem por matéria

### Português (leitura e escrita)

- **Conceitos trabalhados:** leitura de frases curtas, sílabas complexas.
- **Como está indo:** lê com apoio de imagens e já arrisca palavras novas.
- **Próximos passos:** pequenos textos com rimas.

### Matemática

- **Conceitos trabalhados:** adição até 20 com material concreto.
- **Como está indo:** resolve com tampinhas e explica o raciocínio.
- **Próximos passos:** problemas curtos do dia a dia.

## Socialização e convivência

Participa das rodas de conversa e ajuda os colegas nos jogos.

## Como apoiar em casa

1. Leiam juntos 10 minutos por dia, apontando as palavras.
2. Usem tampinhas para somar o lanche da família.
3. Avisem antes de mudanças na rotina.
4. Elogiem o esforço, não só o acerto.
5. Façam pausas curtas a cada 15 minutos de lição.`;

export default function PreviaLinhaDoTempo() {
  return (
    <Suspense>
      <Previa />
    </Suspense>
  );
}

async function Previa() {
  await connection();
  if (process.env.NODE_ENV !== "development") notFound();

  const relatorios = ordenarRelatorios([
    { id: "b2", periodo_inicio: "2026-05-04", periodo_fim: "2026-07-10", bimestre: 2, ano_letivo: 2026, texto: BIMESTRE(2, "Ganhou autonomia nas atividades em grupo.") },
    { id: "b1", periodo_inicio: "2026-02-02", periodo_fim: "2026-04-30", bimestre: 1, ano_letivo: 2026, texto: BIMESTRE(1, "Foi um período de adaptação à turma nova.") },
  ]);

  return (
    <Documento
      titulo="Linha do tempo da aprendizagem"
      subtitulo="Lia Souza · 2º ano B · Ano letivo 2026"
      escola="Escola Raio de Sol"
      logoEscola="/logo.png"
      rodape="Relatórios revisados pelo professor."
    >
      <LinhaDoTempoConteudo nome="Lia Souza" relatorios={relatorios} />
    </Documento>
  );
}
