import Link from "next/link";
import { Cartao, Etiqueta, formatarData } from "@/components/ui";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";

// Encaminhamentos do aluno para quem so le (escola e especialista).
// O RLS decide quais aparecem: a escola ve os revisados; o especialista,
// os enviados para a familia, se a escola liberou os relatorios.
export async function ListaEncaminhamentos({ alunoId }: { alunoId: string }) {
  const supabase = await criarClienteServidor();
  const { data: encaminhamentos } = await supabase
    .from("encaminhamentos")
    .select("id, especialidades, created_at, encaminhamento_assinaturas(nome_assinante, assinado_em)")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false });
  if (!encaminhamentos?.length) return null;

  return (
    <Cartao>
      <h2 className="text-xl font-semibold">Encaminhamentos</h2>
      <ul className="mt-3 space-y-3">
        {encaminhamentos.map((e) => {
          const assinatura = e.encaminhamento_assinaturas?.[0];
          return (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{formatarData(e.created_at)}</p>
                {e.especialidades.length > 0 && (
                  <p className="text-base">Avaliação com: {e.especialidades.map(rotuloProfissao).join(", ")}</p>
                )}
                <p className="mt-1">
                  {assinatura ? (
                    <Etiqueta tipo="revisado">
                      Assinado por {assinatura.nome_assinante} em {formatarData(assinatura.assinado_em)}
                    </Etiqueta>
                  ) : (
                    <Etiqueta tipo="rascunho">Sem assinatura da família</Etiqueta>
                  )}
                </p>
              </div>
              <Link href={`/imprimir/encaminhamento/${e.id}`} target="_blank" className="underline underline-offset-4">
                Imprimir
              </Link>
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}
