import { notFound } from "next/navigation";
import { Suspense } from "react";
import { criarClienteServidor } from "@/lib/supabase/server";
import { Documento } from "../../documento";

// Professor (dono) ou familia (se compartilhada) podem abrir: o RLS decide
export default function ImprimirAtividade({ params }: PageProps<"/imprimir/atividade/[id]">) {
  return (
    <Suspense>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: atividade } = await supabase
    .from("atividades")
    .select("titulo, conteudo_adaptado, status, alunos(nome)")
    .eq("id", id)
    .maybeSingle();
  // So atividades revisadas viram PDF
  if (!atividade || atividade.status !== "revisado") notFound();
  const aluno = Array.isArray(atividade.alunos) ? atividade.alunos[0] : atividade.alunos;

  return <Documento titulo={atividade.titulo} subtitulo={aluno?.nome ? `Aluno: ${aluno.nome}` : undefined} texto={atividade.conteudo_adaptado ?? ""} />;
}
