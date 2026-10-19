import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BarraExportar } from "@/components/barra-exportar";
import { Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { rotuloTipoReforco } from "@/lib/opcoes-cadastro";
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

type Pedido = {
  id: string;
  tipo: string;
  materia: string | null;
  tema: string | null;
  tempo_minutos: number | null;
  pedido: string;
  resposta: string | null;
  created_at: string;
};

function Etiquetas({ p }: { p: Pedido }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Etiqueta tipo="casa">{rotuloTipoReforco(p.tipo)}</Etiqueta>
      {p.materia && <Etiqueta>{p.materia}</Etiqueta>}
      {p.tempo_minutos && <Etiqueta>{p.tempo_minutos} min</Etiqueta>}
      <span className="text-base">{formatarData(p.created_at, true)}</span>
    </div>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: pedidos }, { data: aluno }] = await Promise.all([
    supabase
      .from("reforcos")
      .select("id, tipo, materia, tema, tempo_minutos, pedido, resposta, created_at")
      .eq("aluno_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("alunos").select("nome").eq("id", id).maybeSingle(),
  ]);
  const nomeCrianca = aluno?.nome?.split(" ")[0] ?? "a criança";
  const [ultimo, ...anteriores] = (pedidos ?? []) as Pedido[];

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Cartao className="h-fit xl:col-span-2">
        <h2 className="text-xl font-semibold">Assistente de reforço</h2>
        <p className="mb-5 mt-1">
          Escolha a matéria e o conteúdo: você recebe um passo a passo, jeitos diferentes de ensinar e um material pronto para{" "}
          {nomeCrianca}.
        </p>
        <FormularioReforco alunoId={id} nomeCrianca={nomeCrianca} />
      </Cartao>

      <section className="min-w-0 space-y-4 xl:col-span-3" aria-labelledby="titulo-orientacoes">
        <h2 id="titulo-orientacoes" className="text-xl font-semibold">
          Orientações e materiais
        </h2>
        {!ultimo ? (
          <Vazio>As orientações e os materiais aparecem aqui, e ficam guardados para você consultar e imprimir depois.</Vazio>
        ) : (
          <>
            <Cartao className="border-l-4 border-petroleo">
              <Etiquetas p={ultimo} />
              <h3 className="mt-2 text-lg font-semibold">{ultimo.tema || rotuloTipoReforco(ultimo.tipo)}</h3>
              {ultimo.pedido && ultimo.pedido !== ultimo.tema && <p className="mt-1 italic">“{ultimo.pedido}”</p>}
              {ultimo.resposta && (
                <>
                  <div className="mt-4">
                    <TextoFormatado texto={ultimo.resposta} />
                  </div>
                  <div className="mt-6 max-w-md rounded-2xl bg-creme/60 p-4">
                    <h4 className="mb-3 font-semibold">Baixar ou copiar</h4>
                    <BarraExportar tipo="reforco" atividadeId={ultimo.id} titulo={ultimo.tema || "Reforço"} texto={ultimo.resposta} />
                  </div>
                </>
              )}
            </Cartao>
            {anteriores.length > 0 && (
              <ul className="space-y-3">
                {anteriores.map((r) => (
                  <li key={r.id}>
                    <Cartao>
                      <details>
                        <summary className="cursor-pointer">
                          <span className="font-semibold">{r.tema || rotuloTipoReforco(r.tipo)}</span>
                          <span className="mt-1 block">
                            <Etiquetas p={r} />
                          </span>
                        </summary>
                        {r.resposta && (
                          <>
                            <div className="mt-3">
                              <TextoFormatado texto={r.resposta} />
                            </div>
                            <div className="mt-5 max-w-md">
                              <BarraExportar tipo="reforco" atividadeId={r.id} titulo={r.tema || "Reforço"} texto={r.resposta} />
                            </div>
                          </>
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
