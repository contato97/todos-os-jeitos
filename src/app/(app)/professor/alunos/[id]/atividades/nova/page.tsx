import Link from "next/link";
import { Suspense } from "react";
import { Cartao } from "@/components/ui";
import { FormularioNovaAtividade } from "./formulario-nova-atividade";

export default function NovaAtividade({ params }: PageProps<"/professor/alunos/[id]/atividades/nova">) {
  return (
    <Suspense>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Link href={`/professor/alunos/${id}/atividades`} className="underline underline-offset-4">
        ← Atividades
      </Link>
      <h2 className="mb-4 mt-4 text-xl font-semibold">Adaptar nova atividade</h2>
      <Cartao className="max-w-4xl">
        <FormularioNovaAtividade alunoId={id} />
      </Cartao>
    </>
  );
}
