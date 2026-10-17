import { notFound } from "next/navigation";
import { Suspense } from "react";
import { versaoDoAluno } from "@/lib/atividade-texto";
import { criarClienteServidor } from "@/lib/supabase/server";
import { Documento } from "../../documento";

// Professor (dono) ou familia (se compartilhada) podem abrir: o RLS decide
export default function ImprimirAtividade({ params, searchParams }: PageProps<"/imprimir/atividade/[id]">) {
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
  const somenteAluno = (await searchParams).versao !== "completa";
  const supabase = await criarClienteServidor();
  const { data: atividade } = await supabase
    .from("atividades")
    .select("titulo, conteudo_adaptado, status, alunos(nome)")
    .eq("id", id)
    .maybeSingle();
  // So atividades revisadas viram PDF
  if (!atividade || atividade.status !== "revisado") notFound();
  const aluno = Array.isArray(atividade.alunos) ? atividade.alunos[0] : atividade.alunos;

  return <Documento titulo={atividade.titulo} subtitulo={aluno?.nome ? `Aluno: ${aluno.nome}` : undefined} texto={somenteAluno ? versaoDoAluno(atividade.conteudo_adaptado ?? "") : (atividade.conteudo_adaptado ?? "")} />;
}
