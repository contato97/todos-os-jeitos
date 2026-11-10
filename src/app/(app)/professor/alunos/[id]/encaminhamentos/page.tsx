import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { diasAtras } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioNovoEncaminhamento } from "./formulario-novo-encaminhamento";

export default function Encaminhamentos({ params }: PageProps<"/professor/alunos/[id]/encaminhamentos">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.encaminhamentos} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: encaminhamentos } = await supabase
    .from("encaminhamentos")
    .select("id, motivo, status, compartilhado_com_familia, created_at, encaminhamento_assinaturas(nome_assinante, assinado_em)")
    .eq("aluno_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Cartao className="h-fit lg:col-span-2">
        <h2 className="text-xl font-semibold">Novo encaminhamento</h2>
        <p className="mb-4 mt-1">
          A IA prepara um relatório simples e objetivo para a família levar a um profissional, com o que você observou e
          que tipo de profissional procurar. Nunca cita diagnóstico.
        </p>
        <FormularioNovoEncaminhamento alunoId={id} inicio={diasAtras(90)} />
      </Cartao>

      <section className="lg:col-span-3" aria-labelledby="titulo-encaminhamentos">
        <h2 id="titulo-encaminhamentos" className="mb-4 text-xl font-semibold">
          Encaminhamentos
        </h2>
        {!encaminhamentos?.length ? (
          <Vazio>Nenhum encaminhamento ainda.</Vazio>
        ) : (
          <ul className="space-y-3">
            {encaminhamentos.map((e) => {
              const assinaturas = e.encaminhamento_assinaturas ?? [];
              return (
                <li key={e.id}>
                  <Link href={`/professor/alunos/${id}/encaminhamentos/${e.id}`} className="block">
                    <Cartao className="hover:ring-petroleo">
                      <p className="text-lg font-semibold">{formatarData(e.created_at)}</p>
                      <p className="mt-1 line-clamp-2">{e.motivo}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {e.status === "rascunho" ? <Etiqueta tipo="rascunho">Rascunho</Etiqueta> : <Etiqueta tipo="revisado">Revisado</Etiqueta>}
                        {assinaturas.length > 0 ? (
                          <Etiqueta tipo="compartilhado">Assinado pela família</Etiqueta>
                        ) : (
                          e.compartilhado_com_familia && <Etiqueta tipo="casa">Aguardando assinatura</Etiqueta>
                        )}
                      </div>
                    </Cartao>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
