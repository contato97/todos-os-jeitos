import { notFound } from "next/navigation";
import { BarraExportar } from "@/components/barra-exportar";
import { Cartao, TextoFormatado } from "@/components/ui";

// So em desenvolvimento: ver a barra de exportacao com uma atividade de exemplo
const EXEMPLO = `# Somando com dinossauros

Hoje vamos **somar** usando os dinossauros!

1. O Tricerátops tem 4 folhas. Ganhou mais 3. Quantas folhas tem agora?
2. Havia 5 pegadas na areia. Apareceram mais 1. Quantas pegadas?

## Dicas para o professor

- Leia o enunciado em voz alta antes.`;

export default function BarraTeste() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-8 lg:grid-cols-3">
      <Cartao className="lg:col-span-2">
        <TextoFormatado texto={EXEMPLO} />
      </Cartao>
      <Cartao>
        <h2 className="mb-2 font-semibold">Baixar e compartilhar</h2>
        <BarraExportar atividadeId="exemplo" titulo="Somando com dinossauros" texto={EXEMPLO} nomeAluno="Exemplo" />
      </Cartao>
    </main>
  );
}
