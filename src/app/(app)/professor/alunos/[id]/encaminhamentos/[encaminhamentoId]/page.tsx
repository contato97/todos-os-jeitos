import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { AssinaturasEncaminhamento } from "@/components/area/assinaturas-encaminhamento";
import { BOTAO, Cartao, Etiqueta, TextoFormatado, formatarData } from "@/components/ui";
import { AVISO_DIAGNOSTICO, mencionaDiagnostico } from "@/lib/ia/diagnostico";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarEncaminhamento } from "../../../../acoes";
import { EditorEncaminhamento } from "./editor-encaminhamento";

export default function PaginaEncaminhamento({
  params,
}: PageProps<"/professor/alunos/[id]/encaminhamentos/[encaminhamentoId]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string; encaminhamentoId: string }> }) {
  const { id, encaminhamentoId } = await params;
  const supabase = await criarClienteServidor();
  const { data: enc } = await supabase
    .from("encaminhamentos")
    .select("*, encaminhamento_assinaturas(id, nome_assinante, papel, cargo, conteudo_sha256, assinado_em)")
    .eq("id", encaminhamentoId)
    .maybeSingle();
  if (!enc) notFound();
  const revisado = enc.status === "revisado";
  const assinaturas = enc.encaminhamento_assinaturas ?? [];
  const assinado = assinaturas.length > 0;

  return (
    <>
      <Link href={`/professor/alunos/${id}/encaminhamentos`} className="underline underline-offset-4">
        ← Encaminhamentos
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <Cartao className="min-w-0 lg:col-span-2">
          <h2 className="mb-1 text-xl font-semibold">Encaminhamento de {formatarData(enc.created_at)}</h2>
          <p className="mb-4 text-base">Motivo informado: {enc.motivo}</p>
          {assinado ? (
            <>
              <p className="mb-5 rounded-xl bg-salvia/20 p-4">
                <strong>Documento assinado.</strong> O texto ficou travado para manter fiel o que foi assinado.
              </p>
              <TextoFormatado texto={enc.conteudo ?? ""} />
              {enc.especialidades.length > 0 && (
                <p className="mt-4">
                  <strong>Profissionais sugeridos:</strong> {enc.especialidades.map(rotuloProfissao).join(", ")}
                </p>
              )}
            </>
          ) : (
            <>
              {!revisado && (
                <p className="mb-5 rounded-xl bg-mostarda/15 p-4">
                  <strong>Rascunho da IA.</strong> Confira se tudo corresponde ao que você observou e ajuste o que precisar.
                  O encaminhamento descreve fatos e sugere tipos de profissional, sem diagnóstico.
                </p>
              )}
              <EditorEncaminhamento
                encaminhamento={enc}
                avisoInicial={mencionaDiagnostico(enc.conteudo) ? AVISO_DIAGNOSTICO : undefined}
              />
            </>
          )}
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h2 className="text-lg font-semibold">Situação</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {revisado ? <Etiqueta tipo="revisado">Revisado</Etiqueta> : <Etiqueta tipo="rascunho">Rascunho</Etiqueta>}
              {assinado ? (
                <Etiqueta tipo="compartilhado">Assinado</Etiqueta>
              ) : (
                enc.compartilhado_com_familia && <Etiqueta tipo="casa">Aguardando assinatura</Etiqueta>
              )}
            </div>
            <AssinaturasEncaminhamento assinaturas={assinaturas} />
            {revisado ? (
              <Link href={`/imprimir/encaminhamento/${enc.id}`} target="_blank" className={`${BOTAO} mt-4 w-full`}>
                Imprimir ou salvar em PDF
              </Link>
            ) : (
              <p className="mt-4 text-base">A impressão fica disponível depois da revisão.</p>
            )}
          </Cartao>
          {!assinado && (
            <details className="rounded-2xl p-2">
              <summary className="cursor-pointer text-base underline underline-offset-4">Apagar encaminhamento</summary>
              <form action={apagarEncaminhamento.bind(null, enc.id, id)} className="mt-3">
                <button type="submit" className="rounded-full px-4 py-2 font-medium ring-2 ring-coral">
                  Apagar definitivamente
                </button>
              </form>
            </details>
          )}
        </div>
      </div>
    </>
  );
}
