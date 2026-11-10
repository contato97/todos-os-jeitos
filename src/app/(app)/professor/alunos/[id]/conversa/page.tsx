import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Conversa } from "@/components/area/conversa";
import { Carregando } from "@/components/area/em-breve";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";

export default function ConversaProfessor({ params }: PageProps<"/professor/alunos/[id]/conversa">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.conversa} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Conversa alunoId={id} papel="professor" />;
}
