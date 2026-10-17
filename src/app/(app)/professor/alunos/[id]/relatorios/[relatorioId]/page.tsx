import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, BOTAO_SECUNDARIO, Cartao, Etiqueta, formatarData } from "@/components/ui";
import { AVISO_DIAGNOSTICO, mencionaDiagnostico } from "@/lib/ia/diagnostico";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarRelatorio } from "../../../../acoes";
import { EditorRelatorio } from "./editor-relatorio";

export default function PaginaRelatorio({ params }: PageProps<"/professor/alunos/[id]/relatorios/[relatorioId]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string; relatorioId: string }> }) {
  const { id, relatorioId } = await params;
  const supabase = await criarClienteServidor();
  const { data: relatorio } = await supabase.from("relatorios").select("*").eq("id", relatorioId).maybeSingle();
  if (!relatorio) notFound();
  const revisado = relatorio.status === "revisado";

  return (
    <>
      <Link href={`/professor/alunos/${id}/relatorios`} className="underline underline-offset-4">
        ← Relatórios
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">
            Relatório de {formatarData(relatorio.periodo_inicio)} a {formatarData(relatorio.periodo_fim)}
          </h2>
          {!revisado && (
            <p className="mb-5 rounded-xl bg-mostarda/15 p-4">
              <strong>Rascunho da IA.</strong> Confira se tudo corresponde ao que você observou e ajuste o que precisar.
            </p>
          )}
          <EditorRelatorio
            relatorio={relatorio}
            avisoInicial={
              mencionaDiagnostico(`${relatorio.versao_familia} ${relatorio.versao_tecnica}`) ? AVISO_DIAGNOSTICO : undefined
            }
          />
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h2 className="text-lg font-semibold">Situação</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {revisado ? <Etiqueta tipo="revisado">Revisado</Etiqueta> : <Etiqueta tipo="rascunho">Rascunho</Etiqueta>}
              {relatorio.compartilhado_com_familia && <Etiqueta tipo="compartilhado">Família vê</Etiqueta>}
            </div>
            {revisado ? (
              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/imprimir/relatorio/${relatorio.id}?versao=familia`} target="_blank" className={BOTAO}>
                  PDF para a família
                </Link>
                <Link href={`/imprimir/relatorio/${relatorio.id}?versao=tecnica`} target="_blank" className={BOTAO_SECUNDARIO}>
                  PDF técnico
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-base">Os PDFs ficam disponíveis depois da revisão.</p>
            )}
          </Cartao>
          <details className="rounded-2xl p-2">
            <summary className="cursor-pointer text-base underline underline-offset-4">Apagar relatório</summary>
            <form action={apagarRelatorio.bind(null, relatorio.id, id)} className="mt-3">
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
