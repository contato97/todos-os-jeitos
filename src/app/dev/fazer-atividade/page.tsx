import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FazerAtividade } from "@/app/(app)/familia/filhos/[id]/reforco/[reforcoId]/fazer/fazer-atividade";
import { Cartao } from "@/components/ui";
import { blocosDoMaterial, materialDaCrianca, quantidadeDeRespostas } from "@/lib/atividade-texto";

// So em desenvolvimento: previa do "Fazer na plataforma" com um material de exemplo
const RESPOSTA = `# Somando com dinossauros

## Para você, adulto
Separe 20 tampinhas.

## Material para a criança

Conte os dinossauros e escreva quantos são:

1. **2 + 3 =** ______
2. **4 + 1 =** ______
3. Qual dinossauro é o maior? ______ Por quê? ______

Desenhe o seu dinossauro preferido no papel!

## Respostas (para o adulto)
5, 5`;

export default function PreviaFazer() {
  return (
    <Suspense>
      <Previa />
    </Suspense>
  );
}

async function Previa() {
  await connection();
  if (process.env.NODE_ENV !== "development") notFound();
  const blocos = blocosDoMaterial(materialDaCrianca(RESPOSTA) ?? "");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="mb-4">Campos esperados: {quantidadeDeRespostas(blocos)}</p>
      <Cartao>
        <FazerAtividade
          reforcoId="exemplo"
          alunoId="exemplo"
          blocos={blocos}
          respostasIniciais={["5"]}
          comoFoiInicial={null}
          observacaoInicial={null}
        />
      </Cartao>
    </main>
  );
}
