import type { NextRequest } from "next/server";
import { versaoDoAluno } from "@/lib/atividade-texto";
import { gerarPdf } from "@/lib/exportar/pdf";
import { gerarWord } from "@/lib/exportar/word";

// Pre-visualizacao dos downloads com uma atividade de exemplo, so em desenvolvimento:
// /dev/exportar?formato=pdf  ou  /dev/exportar?formato=word
const EXEMPLO = `# Somando com dinossauros 🦕

Hoje vamos **somar** usando os dinossauros!

## Exemplo

O T-Rex tem **3 ovos**. A mamãe trouxe mais **2 ovos**.
3 + 2 = **5 ovos**

## Agora é sua vez

1. O Tricerátops tem 4 folhas. Ganhou mais 3. Quantas folhas tem agora?
   [desenho de folhas]
2. Havia 5 pegadas na areia. Apareceram mais 1. Quantas pegadas?
3. Conte os dinossauros e escreva o total: 🦕🦕🦕 + 🦖🦖

Lembre-se:
- Leia uma questão por vez.
- Pode usar os dedos ou desenhar bolinhas.

## Dicas para o professor

- Leia o enunciado em voz alta antes.
- Ofereça material concreto (tampinhas) para contar.`;

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new Response("Não encontrado", { status: 404 });
  const formato = request.nextUrl.searchParams.get("formato");
  const texto = request.nextUrl.searchParams.get("versao") === "completa" ? EXEMPLO : versaoDoAluno(EXEMPLO);
  const site = request.nextUrl.origin;

  if (formato === "word") {
    const logo = await fetch(`${site}/logo.png`).then((r) => r.arrayBuffer());
    const arquivo = await gerarWord({ titulo: "Somando com dinossauros", subtitulo: "Aluno(a): Exemplo", texto, logo });
    return new Response(new Uint8Array(arquivo), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="exemplo.docx"',
      },
    });
  }
  const arquivo = await gerarPdf({ titulo: "Somando com dinossauros", subtitulo: "Aluno(a): Exemplo", texto, site });
  return new Response(new Uint8Array(arquivo), { headers: { "Content-Type": "application/pdf" } });
}
