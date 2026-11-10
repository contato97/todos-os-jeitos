import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AssinaturasEncaminhamento } from "@/components/area/assinaturas-encaminhamento";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, TextoFormatado, formatarData } from "@/components/ui";
import { buscarUsuario } from "@/lib/auth";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioAssinatura } from "./formulario-assinatura";

export default function EncaminhamentoFamilia({
  params,
}: PageProps<"/familia/filhos/[id]/encaminhamentos/[encaminhamentoId]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string; encaminhamentoId: string }> }) {
  const { id, encaminhamentoId } = await params;
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  const { data: enc } = await supabase
    .from("encaminhamentos")
    .select(
      "id, conteudo, especialidades, created_at, encaminhamento_assinaturas(id, assinante_id, nome_assinante, papel, cargo, conteudo_sha256, assinado_em)",
    )
    .eq("id", encaminhamentoId)
    .eq("aluno_id", id)
    .maybeSingle();
  if (!enc) notFound();
  const assinaturas = enc.encaminhamento_assinaturas ?? [];
  const assinei = assinaturas.some((a) => a.assinante_id === usuario?.id);

  return (
    <>
      <Link href={`/familia/filhos/${id}/encaminhamentos`} className="underline underline-offset-4">
        ← Encaminhamentos
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <Cartao className="min-w-0 lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Encaminhamento de {formatarData(enc.created_at)}</h2>
          <TextoFormatado texto={enc.conteudo ?? ""} />
          {enc.especialidades.length > 0 && (
            <p className="mt-4">
              <strong>Profissionais sugeridos para avaliação:</strong> {enc.especialidades.map(rotuloProfissao).join(", ")}
            </p>
          )}
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h2 className="text-lg font-semibold">{assinei ? "Assinatura" : "Assinar"}</h2>
            {assinei ? (
              <p className="mt-1">Você já assinou este encaminhamento.</p>
            ) : (
              <div className="mt-3">
                <FormularioAssinatura encaminhamentoId={enc.id} nomeSugerido={usuario?.nome ?? ""} />
              </div>
            )}
            <AssinaturasEncaminhamento assinaturas={assinaturas} />
            <Link href={`/imprimir/encaminhamento/${enc.id}`} target="_blank" className={`${BOTAO} mt-4 w-full`}>
              Imprimir ou salvar em PDF
            </Link>
          </Cartao>
        </div>
      </div>
    </>
  );
}
