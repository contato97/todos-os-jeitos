import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO_DISCRETO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { hoje } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarObservacao, compartilharObservacao } from "../../../acoes";
import { FormularioObservacao } from "./formulario-observacao";

export default function Observacoes({ params }: PageProps<"/professor/alunos/[id]/observacoes">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.observacoes} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const { data: observacoes } = await supabase
    .from("observacoes")
    .select("id, texto, data_observacao, origem, visivel_familia, autor_id, perfis(nome)")
    .eq("aluno_id", id)
    .order("data_observacao", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Cartao className="h-fit lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold">Nova observação</h2>
        <FormularioObservacao alunoId={id} hoje={hoje()} />
      </Cartao>

      <section className="lg:col-span-3" aria-labelledby="titulo-historico">
        <h2 id="titulo-historico" className="mb-4 text-xl font-semibold">
          Histórico
        </h2>
        {!observacoes?.length ? (
          <Vazio>Nenhuma observação ainda. Registre a primeira ao lado.</Vazio>
        ) : (
          <ul className="space-y-3">
            {observacoes.map((o) => {
              const autor = Array.isArray(o.perfis) ? o.perfis[0] : o.perfis;
              const minha = o.autor_id === usuario?.id;
              return (
                <li key={o.id}>
                  <Cartao>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{formatarData(o.data_observacao)}</span>
                      {o.origem === "casa" ? (
                        <Etiqueta tipo="casa">De casa{autor?.nome ? ` · ${autor.nome}` : ""}</Etiqueta>
                      ) : o.visivel_familia ? (
                        <Etiqueta tipo="compartilhado">Compartilhada com a família</Etiqueta>
                      ) : (
                        <Etiqueta>Só você vê</Etiqueta>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line">{o.texto}</p>
                    {minha && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <form action={compartilharObservacao.bind(null, o.id, !o.visivel_familia)}>
                          <button type="submit" className={BOTAO_DISCRETO}>
                            {o.visivel_familia ? "Parar de compartilhar" : "Compartilhar com a família"}
                          </button>
                        </form>
                        <form action={apagarObservacao.bind(null, o.id)}>
                          <button type="submit" className={BOTAO_DISCRETO}>
                            Apagar
                          </button>
                        </form>
                      </div>
                    )}
                  </Cartao>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
