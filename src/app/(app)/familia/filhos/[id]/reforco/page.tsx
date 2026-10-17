import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioReforco } from "./formulario-reforco";

export default function Reforco({ params }: PageProps<"/familia/filhos/[id]/reforco">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.reforco} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: pedidos } = await supabase
    .from("reforcos")
    .select("id, tipo, pedido, resposta, created_at")
    .eq("aluno_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const [ultimo, ...anteriores] = pedidos ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Cartao className="h-fit lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold">Pedir apoio</h2>
        <FormularioReforco alunoId={id} />
      </Cartao>

      <section className="space-y-4 lg:col-span-3" aria-labelledby="titulo-orientacoes">
        <h2 id="titulo-orientacoes" className="text-xl font-semibold">Orientações</h2>
        {!ultimo ? (
          <Vazio>As orientações da IA aparecem aqui, e ficam guardadas para você consultar depois.</Vazio>
        ) : (
          <>
            <Cartao className="border-l-4 border-petroleo">
              <div className="flex flex-wrap items-center gap-2">
                <Etiqueta tipo="casa">{ultimo.tipo === "licao" ? "Lição de casa" : "Reforço"}</Etiqueta>
                <span className="text-base">{formatarData(ultimo.created_at, true)}</span>
              </div>
              <p className="mt-2 italic">“{ultimo.pedido}”</p>
              {ultimo.resposta && (
                <div className="mt-4">
                  <TextoFormatado texto={ultimo.resposta} />
                </div>
              )}
            </Cartao>
            {anteriores.length > 0 && (
              <ul className="space-y-3">
                {anteriores.map((r) => (
                  <li key={r.id}>
                    <Cartao>
                      <details>
                        <summary className="cursor-pointer">
                          <span className="font-semibold">{r.tipo === "licao" ? "Lição de casa" : "Reforço"}</span> ·{" "}
                          {formatarData(r.created_at, true)} · {r.pedido.slice(0, 60)}
                          {r.pedido.length > 60 ? "…" : ""}
                        </summary>
                        {r.resposta && (
                          <div className="mt-3">
                            <TextoFormatado texto={r.resposta} />
                          </div>
                        )}
                      </details>
                    </Cartao>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
