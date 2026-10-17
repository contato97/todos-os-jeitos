import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";

// Historico do filho: so o que o professor compartilhou (o RLS garante)
export default function Historico({ params }: PageProps<"/familia/filhos/[id]">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.historico} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

type RelatorioFamilia = { id: string; periodo_inicio: string; periodo_fim: string; versao_familia: string | null };

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: observacoes }, { data: atividades }, { data: relatorios }, { data: aluno }] = await Promise.all([
    supabase
      .from("observacoes")
      .select("id, texto, data_observacao")
      .eq("aluno_id", id)
      .eq("origem", "escola")
      .order("data_observacao", { ascending: false })
      .limit(30),
    supabase.from("atividades").select("id, titulo, conteudo_adaptado, atualizado_em").eq("aluno_id", id).order("atualizado_em", { ascending: false }),
    supabase.rpc("relatorios_para_familia", { p_aluno: id }),
    supabase.from("alunos").select("professor_id").eq("id", id).maybeSingle(),
  ]);
  const { data: professor } = aluno
    ? await supabase.from("perfis").select("nome").eq("id", aluno.professor_id).maybeSingle()
    : { data: null };
  const rels = (relatorios ?? []) as RelatorioFamilia[];

  return (
    <div className="space-y-8">
      {professor && <p>Professor(a): <strong>{professor.nome}</strong></p>}

      <section aria-labelledby="titulo-rel">
        <h2 id="titulo-rel" className="mb-3 text-xl font-semibold">Relatórios</h2>
        {rels.length === 0 ? (
          <Vazio>Quando o professor compartilhar um relatório, ele aparece aqui.</Vazio>
        ) : (
          <ul className="space-y-3">
            {rels.map((r) => (
              <li key={r.id}>
                <Cartao>
                  <details>
                    <summary className="cursor-pointer text-lg font-semibold">
                      {formatarData(r.periodo_inicio)} a {formatarData(r.periodo_fim)}
                    </summary>
                    <div className="mt-3">
                      <TextoFormatado texto={r.versao_familia ?? ""} />
                      <Link href={`/imprimir/relatorio/${r.id}?versao=familia&aluno=${id}`} target="_blank" className="mt-4 inline-block underline underline-offset-4">
                        Baixar PDF
                      </Link>
                    </div>
                  </details>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-ativ">
        <h2 id="titulo-ativ" className="mb-3 text-xl font-semibold">Atividades adaptadas</h2>
        {!atividades?.length ? (
          <Vazio>As atividades que o professor compartilhar aparecem aqui, para você acompanhar ou repetir em casa.</Vazio>
        ) : (
          <ul className="space-y-3">
            {atividades.map((a) => (
              <li key={a.id}>
                <Cartao>
                  <details>
                    <summary className="cursor-pointer text-lg font-semibold">{a.titulo}</summary>
                    <div className="mt-3">
                      <TextoFormatado texto={a.conteudo_adaptado ?? ""} />
                      <Link href={`/imprimir/atividade/${a.id}`} target="_blank" className="mt-4 inline-block underline underline-offset-4">
                        Baixar PDF
                      </Link>
                    </div>
                  </details>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-obs">
        <h2 id="titulo-obs" className="mb-3 text-xl font-semibold">Observações da escola</h2>
        {!observacoes?.length ? (
          <Vazio>Nenhuma observação compartilhada ainda.</Vazio>
        ) : (
          <ul className="space-y-3">
            {observacoes.map((o) => (
              <li key={o.id}>
                <Cartao>
                  <Etiqueta>{formatarData(o.data_observacao)}</Etiqueta>
                  <p className="mt-2 whitespace-pre-line">{o.texto}</p>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
