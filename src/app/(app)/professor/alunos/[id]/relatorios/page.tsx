import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { diasAtras, hoje } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioNovoRelatorio } from "./formulario-novo-relatorio";

export default function Relatorios({ params }: PageProps<"/professor/alunos/[id]/relatorios">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.relatorios} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: relatorios } = await supabase
    .from("relatorios")
    .select("id, periodo_inicio, periodo_fim, status, compartilhado_com_familia, created_at")
    .eq("aluno_id", id)
    .order("created_at", { ascending: false });

  // Sugestao de periodo: ultimos 30 dias
  const fim = hoje();
  const inicio = diasAtras(30);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Cartao className="h-fit lg:col-span-2">
        <h2 className="text-xl font-semibold">Novo relatório</h2>
        <p className="mb-4 mt-1">A IA usa o perfil e as observações do período (da escola e de casa).</p>
        <FormularioNovoRelatorio alunoId={id} inicio={inicio} fim={fim} />
      </Cartao>

      <section className="lg:col-span-3" aria-labelledby="titulo-relatorios">
        <h2 id="titulo-relatorios" className="mb-4 text-xl font-semibold">
          Relatórios
        </h2>
        {!relatorios?.length ? (
          <Vazio>Nenhum relatório ainda.</Vazio>
        ) : (
          <ul className="space-y-3">
            {relatorios.map((r) => (
              <li key={r.id}>
                <Link href={`/professor/alunos/${id}/relatorios/${r.id}`} className="block">
                  <Cartao className="hover:ring-petroleo">
                    <p className="text-lg font-semibold">
                      {formatarData(r.periodo_inicio)} a {formatarData(r.periodo_fim)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.status === "rascunho" ? <Etiqueta tipo="rascunho">Rascunho</Etiqueta> : <Etiqueta tipo="revisado">Revisado</Etiqueta>}
                      {r.compartilhado_com_familia && <Etiqueta tipo="compartilhado">Família vê</Etiqueta>}
                    </div>
                  </Cartao>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
