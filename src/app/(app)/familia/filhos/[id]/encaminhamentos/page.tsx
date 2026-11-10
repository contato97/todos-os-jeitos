import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";

export default function EncaminhamentosFamilia({ params }: PageProps<"/familia/filhos/[id]/encaminhamentos">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.encaminhamentos} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  // O RLS so devolve os encaminhamentos revisados e enviados para a familia
  const { data: encaminhamentos } = await supabase
    .from("encaminhamentos")
    .select("id, especialidades, created_at, encaminhamento_assinaturas(assinante_id)")
    .eq("aluno_id", id)
    .order("created_at", { ascending: false });

  if (!encaminhamentos?.length) {
    return <Vazio>Quando o professor enviar um encaminhamento, ele aparece aqui para você ler e assinar.</Vazio>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {encaminhamentos.map((e) => {
        const assinei = (e.encaminhamento_assinaturas ?? []).some((a) => a.assinante_id === usuario?.id);
        return (
          <li key={e.id}>
            <Link href={`/familia/filhos/${id}/encaminhamentos/${e.id}`} className="block h-full">
              <Cartao className="h-full hover:ring-petroleo">
                <p className="text-lg font-semibold">Encaminhamento de {formatarData(e.created_at)}</p>
                {e.especialidades.length > 0 && (
                  <p className="mt-1">Avaliação com: {e.especialidades.map(rotuloProfissao).join(", ")}</p>
                )}
                <div className="mt-3">
                  {assinei ? (
                    <Etiqueta tipo="revisado">Você assinou</Etiqueta>
                  ) : (
                    <Etiqueta tipo="rascunho">Aguardando sua assinatura</Etiqueta>
                  )}
                </div>
              </Cartao>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
