import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, Etiqueta, formatarData } from "@/components/ui";
import { AVISO_DIAGNOSTICO, mencionaDiagnostico } from "@/lib/ia/diagnostico";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarAtividade } from "../../../../acoes";
import { EditorAtividade } from "./editor-atividade";

export default function PaginaAtividade({ params }: PageProps<"/professor/alunos/[id]/atividades/[atividadeId]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string; atividadeId: string }> }) {
  const { id, atividadeId } = await params;
  const supabase = await criarClienteServidor();
  const { data: atividade } = await supabase.from("atividades").select("*").eq("id", atividadeId).maybeSingle();
  if (!atividade) notFound();

  // Link temporario (10 min) para abrir o PDF original guardado no bucket privado
  let linkOriginal: string | null = null;
  if (atividade.arquivo_original) {
    const { data } = await supabase.storage.from("atividades").createSignedUrl(atividade.arquivo_original, 600);
    linkOriginal = data?.signedUrl ?? null;
  }
  const revisada = atividade.status === "revisado";

  return (
    <>
      <Link href={`/professor/alunos/${id}/atividades`} className="underline underline-offset-4">
        ← Atividades
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          {!revisada && (
            <p className="mb-5 rounded-xl bg-mostarda/15 p-4">
              <strong>Rascunho da IA.</strong> Leia com atenção, edite o que precisar e clique em “Revisei e aprovo”. Só
              depois disso a atividade pode ir para o PDF ou para a família.
            </p>
          )}
          <EditorAtividade
            atividade={atividade}
            avisoInicial={mencionaDiagnostico(atividade.conteudo_adaptado) ? AVISO_DIAGNOSTICO : undefined}
          />
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h2 className="text-lg font-semibold">Situação</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {revisada ? <Etiqueta tipo="revisado">Revisada</Etiqueta> : <Etiqueta tipo="rascunho">Rascunho</Etiqueta>}
              {atividade.compartilhado_com_familia && <Etiqueta tipo="compartilhado">Família vê</Etiqueta>}
            </div>
            <p className="mt-2 text-base">Criada em {formatarData(atividade.created_at)}</p>
            {revisada ? (
              <Link href={`/imprimir/atividade/${atividade.id}`} target="_blank" className={`${BOTAO} mt-4 w-full`}>
                Exportar PDF
              </Link>
            ) : (
              <p className="mt-4 text-base">O PDF fica disponível depois da revisão.</p>
            )}
          </Cartao>

          {(atividade.texto_original || linkOriginal) && (
            <Cartao>
              <h2 className="text-lg font-semibold">Atividade original</h2>
              {linkOriginal && (
                <a href={linkOriginal} target="_blank" rel="noopener noreferrer" className="mt-2 block underline underline-offset-4">
                  Abrir PDF original
                </a>
              )}
              {atividade.texto_original && (
                <p className="mt-2 max-h-80 overflow-y-auto whitespace-pre-line text-base">{atividade.texto_original}</p>
              )}
            </Cartao>
          )}

          <details className="rounded-2xl p-2">
            <summary className="cursor-pointer text-base underline underline-offset-4">Apagar atividade</summary>
            <form action={apagarAtividade.bind(null, atividade.id, id)} className="mt-3">
              <button type="submit" className="rounded-full px-4 py-2 font-medium ring-2 ring-coral">
                Apagar definitivamente
              </button>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
