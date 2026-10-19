import type { NextRequest } from "next/server";
import { materialDaCrianca, nomeDeArquivo } from "@/lib/atividade-texto";
import { gerarPdf } from "@/lib/exportar/pdf";
import { gerarWord } from "@/lib/exportar/word";
import { rotuloTipoReforco } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";

// Download do reforco em Word ou PDF:
//   /exportar/reforco/{id}?formato=word|pdf&versao=aluno|completa
// "aluno" = so o "Material para a crianca". Quem pode baixar e decidido pelo RLS
// (a propria familia e o professor do aluno).
export async function GET(request: NextRequest, { params }: RouteContext<"/exportar/reforco/[id]">) {
  const { id } = await params;
  const formato = request.nextUrl.searchParams.get("formato") === "word" ? "word" : "pdf";
  const somenteMaterial = request.nextUrl.searchParams.get("versao") !== "completa";

  const supabase = await criarClienteServidor();
  const { data: reforco } = await supabase
    .from("reforcos")
    .select("tipo, materia, tema, resposta")
    .eq("id", id)
    .maybeSingle();
  if (!reforco?.resposta) return new Response("Material não encontrado.", { status: 404 });

  const texto = (somenteMaterial && materialDaCrianca(reforco.resposta)) || reforco.resposta;
  const titulo = reforco.tema || rotuloTipoReforco(reforco.tipo);
  const subtitulo = [reforco.materia, somenteMaterial ? "Material para a criança" : "Reforço em casa"].filter(Boolean).join(" · ");
  const site = request.nextUrl.origin;
  const nome = nomeDeArquivo(`reforco-${titulo}`);

  if (formato === "word") {
    const logo = await fetch(`${site}/logo.png`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    const arquivo = await gerarWord({ titulo, subtitulo, texto, logo });
    return new Response(new Uint8Array(arquivo), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${nome}.docx"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const arquivo = await gerarPdf({ titulo, subtitulo, texto, site });
  return new Response(new Uint8Array(arquivo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nome}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
