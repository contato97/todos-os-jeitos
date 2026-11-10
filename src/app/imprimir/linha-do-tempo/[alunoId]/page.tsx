import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cabecalhoDoAluno } from "../../cabecalho";
import { Documento } from "../../documento";
import { LinhaDoTempoConteudo, anosLetivos, ordenarRelatorios, type RelatorioDaLinha } from "../linha";

// Linha do tempo da aprendizagem: todos os relatorios revisados do aluno, em
// ordem (bimestre a bimestre), num documento so para imprimir ou salvar em PDF.
// Pensado para a familia levar a consultas com especialistas.
//   /imprimir/linha-do-tempo/{aluno}?versao=familia|tecnica
// Familia: so os relatorios compartilhados e so a versao da familia.
export default function LinhaDoTempo({ params, searchParams }: PageProps<"/imprimir/linha-do-tempo/[alunoId]">) {
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
  params: Promise<{ alunoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { alunoId } = await params;
  const usuario = await buscarUsuario();
  if (!usuario) notFound();
  const familia = usuario.tipo === "familia";
  const tecnica = (await searchParams).versao === "tecnica" && !familia;
  const supabase = await criarClienteServidor();

  const [{ data: aluno }, cabecalho] = await Promise.all([
    supabase.from("alunos").select("nome, ano_escolar").eq("id", alunoId).maybeSingle(),
    cabecalhoDoAluno(supabase, alunoId),
  ]);
  if (!aluno) notFound();

  let relatorios: RelatorioDaLinha[];
  if (familia) {
    const { data } = await supabase.rpc("relatorios_para_familia", { p_aluno: alunoId });
    relatorios = ((data ?? []) as (Omit<RelatorioDaLinha, "texto"> & { versao_familia: string | null })[]).map((r) => ({
      ...r,
      texto: r.versao_familia,
    }));
  } else {
    // Professor, escola e especialista: o RLS ja limita aos relatorios que cada um pode ver
    const { data } = await supabase
      .from("relatorios")
      .select("id, periodo_inicio, periodo_fim, bimestre, ano_letivo, versao_familia, versao_tecnica")
      .eq("aluno_id", alunoId)
      .eq("status", "revisado");
    relatorios = (data ?? []).map((r) => ({ ...r, texto: tecnica ? r.versao_tecnica : r.versao_familia }));
  }
  relatorios = ordenarRelatorios(relatorios);
  const anos = anosLetivos(relatorios);

  return (
    <Documento
      {...cabecalho}
      titulo={tecnica ? "Linha do tempo da aprendizagem (versão técnica)" : "Linha do tempo da aprendizagem"}
      subtitulo={[aluno.nome, aluno.ano_escolar, anos.length ? `Ano letivo ${anos.join(", ")}` : null]
        .filter(Boolean)
        .join(" · ")}
      rodape={tecnica ? "Documento técnico, compartilhado com autorização da família." : "Relatórios revisados pelo professor."}
    >
      <LinhaDoTempoConteudo nome={aluno.nome} relatorios={relatorios} />
    </Documento>
  );
}
