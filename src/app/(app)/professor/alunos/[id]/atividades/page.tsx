import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";

export default function Atividades({ params }: PageProps<"/professor/alunos/[id]/atividades">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.atividades} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: atividades } = await supabase
    .from("atividades")
    .select("id, titulo, status, compartilhado_com_familia, created_at")
    .eq("aluno_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Atividades adaptadas</h2>
        <Link href={`/professor/alunos/${id}/atividades/nova`} className={BOTAO}>
          Adaptar nova atividade
        </Link>
      </div>
      {!atividades?.length ? (
        <Vazio>Nenhuma atividade ainda. Envie um texto ou PDF e a IA adapta pelo perfil do aluno.</Vazio>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {atividades.map((a) => (
            <li key={a.id}>
              <Link href={`/professor/alunos/${id}/atividades/${a.id}`} className="block">
                <Cartao className="hover:ring-petroleo">
                  <p className="text-lg font-semibold">{a.titulo}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-base">
                    {a.status === "rascunho" ? <Etiqueta tipo="rascunho">Rascunho</Etiqueta> : <Etiqueta tipo="revisado">Revisada</Etiqueta>}
                    {a.compartilhado_com_familia && <Etiqueta tipo="compartilhado">Família vê</Etiqueta>}
                    <span>{formatarData(a.created_at)}</span>
                  </div>
                </Cartao>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
