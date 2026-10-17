import type { NextRequest } from "next/server";
import { nomeDeArquivo, versaoDoAluno } from "@/lib/atividade-texto";
import { gerarPdf } from "@/lib/exportar/pdf";
import { gerarWord } from "@/lib/exportar/word";
import { criarClienteServidor } from "@/lib/supabase/server";

// Download da atividade em Word ou PDF:
//   /exportar/atividade/{id}?formato=word|pdf&versao=aluno|completa
// Quem pode baixar e decidido pelo RLS: o professor dono, a familia (se
// compartilhada) e a escola vinculada. So atividades REVISADAS saem.
export async function GET(request: NextRequest, { params }: RouteContext<"/exportar/atividade/[id]">) {
  const { id } = await params;
  const formato = request.nextUrl.searchParams.get("formato") === "word" ? "word" : "pdf";
  const somenteAluno = request.nextUrl.searchParams.get("versao") !== "completa";

  const supabase = await criarClienteServidor();
  const { data: atividade } = await supabase
    .from("atividades")
    .select("titulo, conteudo_adaptado, status, alunos(nome)")
    .eq("id", id)
    .maybeSingle();
  if (!atividade || atividade.status !== "revisado") {
    return new Response("Atividade não encontrada ou ainda não revisada.", { status: 404 });
  }

  const aluno = Array.isArray(atividade.alunos) ? atividade.alunos[0] : atividade.alunos;
  const texto = somenteAluno ? versaoDoAluno(atividade.conteudo_adaptado ?? "") : (atividade.conteudo_adaptado ?? "");
  const subtitulo = aluno?.nome ? `Aluno(a): ${aluno.nome}` : undefined;
  const site = request.nextUrl.origin;
  const nome = nomeDeArquivo(atividade.titulo);

  if (formato === "word") {
    const logo = await fetch(`${site}/logo.png`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    const arquivo = await gerarWord({ titulo: atividade.titulo, subtitulo, texto, logo });
    return new Response(new Uint8Array(arquivo), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${nome}.docx"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const arquivo = await gerarPdf({ titulo: atividade.titulo, subtitulo, texto, site });
  return new Response(new Uint8Array(arquivo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nome}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
