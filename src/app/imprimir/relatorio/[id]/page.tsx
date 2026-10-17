import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatarData } from "@/components/ui";
import { criarClienteServidor } from "@/lib/supabase/server";
import { Documento } from "../../documento";

export default function ImprimirRelatorio({ params, searchParams }: PageProps<"/imprimir/relatorio/[id]">) {
  return (
    <Suspense>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const busca = await searchParams;
  const tecnica = busca.versao === "tecnica";
  const supabase = await criarClienteServidor();

  // Professor: le a tabela (RLS so libera os proprios relatorios)
  const { data: relatorio } = await supabase
    .from("relatorios")
    .select("periodo_inicio, periodo_fim, versao_familia, versao_tecnica, status, aluno_id, alunos(nome)")
    .eq("id", id)
    .maybeSingle();

  if (relatorio) {
    if (relatorio.status !== "revisado") notFound();
    const aluno = Array.isArray(relatorio.alunos) ? relatorio.alunos[0] : relatorio.alunos;
    return (
      <Documento
        titulo={tecnica ? "Relatório de acompanhamento (versão técnica)" : "Relatório de acompanhamento"}
        subtitulo={`${aluno?.nome ?? ""} · ${formatarData(relatorio.periodo_inicio)} a ${formatarData(relatorio.periodo_fim)}`}
        texto={(tecnica ? relatorio.versao_tecnica : relatorio.versao_familia) ?? ""}
        rodape={tecnica ? "Documento técnico, compartilhado com autorização da família." : undefined}
      />
    );
  }

  // Familia: so a versao acolhedora, pela funcao que nunca devolve a tecnica
  const alunoId = typeof busca.aluno === "string" ? busca.aluno : null;
  if (!alunoId || tecnica) notFound();
  const { data: daFamilia } = await supabase.rpc("relatorios_para_familia", { p_aluno: alunoId });
  const r = (daFamilia as { id: string; periodo_inicio: string; periodo_fim: string; versao_familia: string | null }[] | null)?.find(
    (x) => x.id === id,
  );
  if (!r) notFound();
  return (
    <Documento
      titulo="Relatório de acompanhamento"
      subtitulo={`${formatarData(r.periodo_inicio)} a ${formatarData(r.periodo_fim)}`}
      texto={r.versao_familia ?? ""}
    />
  );
}
