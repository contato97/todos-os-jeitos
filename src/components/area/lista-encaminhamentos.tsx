import Link from "next/link";
import { Cartao, formatarData } from "@/components/ui";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { AssinaturasEncaminhamento } from "./assinaturas-encaminhamento";
import { FormularioAssinarEscola } from "./formulario-assinar-escola";

// Encaminhamentos do aluno para quem so le (escola e especialista).
// O RLS decide quais aparecem: a escola ve os revisados; o especialista,
// os enviados para a familia, se a escola liberou os relatorios.
// escolaAssina: nome sugerido para a escola assinar (so na tela da escola).
export async function ListaEncaminhamentos({ alunoId, escolaAssina }: { alunoId: string; escolaAssina?: string }) {
  const supabase = await criarClienteServidor();
  const { data: encaminhamentos } = await supabase
    .from("encaminhamentos")
    .select("id, especialidades, created_at, encaminhamento_assinaturas(id, nome_assinante, papel, cargo, conteudo_sha256, assinado_em)")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false });
  if (!encaminhamentos?.length) return null;

  return (
    <Cartao>
      <h2 className="text-xl font-semibold">Encaminhamentos</h2>
      <ul className="mt-2 divide-y divide-marca/10">
        {encaminhamentos.map((e) => {
          const assinaturas = e.encaminhamento_assinaturas ?? [];
          return (
            <li key={e.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{formatarData(e.created_at)}</p>
                  {e.especialidades.length > 0 && (
                    <p className="text-base">Avaliação com: {e.especialidades.map(rotuloProfissao).join(", ")}</p>
                  )}
                </div>
                <Link href={`/imprimir/encaminhamento/${e.id}`} target="_blank" className="underline underline-offset-4">
                  Imprimir
                </Link>
              </div>
              {assinaturas.length ? (
                <AssinaturasEncaminhamento assinaturas={assinaturas} />
              ) : (
                <p className="mt-1 text-base">Ainda sem assinaturas.</p>
              )}
              {escolaAssina !== undefined && !assinaturas.some((a) => a.papel === "escola") && (
                <FormularioAssinarEscola documento="encaminhamento" id={e.id} nomeSugerido={escolaAssina} />
              )}
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}
