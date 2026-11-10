import { notFound } from "next/navigation";
import { Suspense } from "react";
import { assinaturasDosRelatorios, cabecalhoDoAluno, periodoDoRelatorio } from "../../cabecalho";
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

  // Professor, escola e especialista: leem a tabela (o RLS decide o que cada um ve)
  const { data: relatorio } = await supabase
    .from("relatorios")
    .select("periodo_inicio, periodo_fim, bimestre, ano_letivo, versao_familia, versao_tecnica, status, aluno_id, alunos(nome)")
    .eq("id", id)
    .maybeSingle();

  if (relatorio) {
    if (relatorio.status !== "revisado") notFound();
    const aluno = Array.isArray(relatorio.alunos) ? relatorio.alunos[0] : relatorio.alunos;
    const [cabecalho, assinaturas] = await Promise.all([
      cabecalhoDoAluno(supabase, relatorio.aluno_id),
      assinaturasDosRelatorios(supabase, [id]),
    ]);
    return (
      <Documento
        {...cabecalho}
        titulo={tecnica ? "Relatório de acompanhamento (versão técnica)" : "Relatório de acompanhamento"}
        subtitulo={`${aluno?.nome ?? ""} · ${periodoDoRelatorio(relatorio)}`}
        texto={(tecnica ? relatorio.versao_tecnica : relatorio.versao_familia) ?? ""}
        rodape={tecnica ? "Documento técnico, compartilhado com autorização da família." : undefined}
      >
        <BlocoAssinaturas linhas={assinaturas.get(id)} />
      </Documento>
    );
  }

  // Familia: so a versao acolhedora, pela funcao que nunca devolve a tecnica
  const alunoId = typeof busca.aluno === "string" ? busca.aluno : null;
  if (!alunoId || tecnica) notFound();
  const [{ data: daFamilia }, { data: aluno }, cabecalho, assinaturas] = await Promise.all([
    supabase.rpc("relatorios_para_familia", { p_aluno: alunoId }),
    supabase.from("alunos").select("nome").eq("id", alunoId).maybeSingle(),
    cabecalhoDoAluno(supabase, alunoId),
    assinaturasDosRelatorios(supabase, [id]),
  ]);
  const r = (daFamilia as RelatorioFamilia[] | null)?.find((x) => x.id === id);
  if (!r) notFound();
  return (
    <Documento
      {...cabecalho}
      titulo="Relatório de acompanhamento"
      subtitulo={`${aluno?.nome ? `${aluno.nome} · ` : ""}${periodoDoRelatorio(r)}`}
      texto={r.versao_familia ?? ""}
    >
      <BlocoAssinaturas linhas={assinaturas.get(id)} />
    </Documento>
  );
}

type RelatorioFamilia = {
  id: string;
  periodo_inicio: string;
  periodo_fim: string;
  bimestre: number | null;
  ano_letivo: number | null;
  versao_familia: string | null;
};

// Assinaturas da escola no fim do relatorio impresso
function BlocoAssinaturas({ linhas }: { linhas?: string[] }) {
  if (!linhas?.length) return null;
  return (
    <section aria-label="Assinaturas" className="mt-10 break-inside-avoid border-t border-marca/20 pt-4">
      {linhas.map((l) => (
        <p key={l} className="text-sm">
          ✓ {l}
        </p>
      ))}
    </section>
  );
}
