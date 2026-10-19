import Link from "next/link";
import { BarraExportar } from "@/components/barra-exportar";
import { Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { versaoDoAluno } from "@/lib/atividade-texto";

// Parte visual do historico do filho. Fica separada da busca de dados para ser
// usada tambem na vitrine com dados de exemplo (/dev/vitrine), sem duplicar codigo.
export type DadosHistorico = {
  id: string; // id do aluno
  professorNome?: string | null;
  relatorios: { id: string; periodo_inicio: string; periodo_fim: string; versao_familia: string | null }[];
  atividades: { id: string; titulo: string; conteudo_adaptado: string | null }[];
  observacoes: { id: string; texto: string; data_observacao: string }[];
  abertos?: boolean; // vitrine: mostra os itens ja expandidos
};

export function HistoricoFamilia({ id, professorNome, relatorios: rels, atividades, observacoes, abertos }: DadosHistorico) {
  return (
    <div className="space-y-8">
      {professorNome && <p>Professor(a): <strong>{professorNome}</strong></p>}

      <section aria-labelledby="titulo-rel">
        <h2 id="titulo-rel" className="mb-3 text-xl font-semibold">Relatórios</h2>
        {rels.length === 0 ? (
          <Vazio>Quando o professor compartilhar um relatório, ele aparece aqui.</Vazio>
        ) : (
          <ul className="space-y-3">
            {rels.map((r) => (
              <li key={r.id}>
                <Cartao>
                  <details open={abertos}>
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
        {!atividades.length ? (
          <Vazio>As atividades que o professor compartilhar aparecem aqui, para você acompanhar ou repetir em casa.</Vazio>
        ) : (
          <ul className="space-y-3">
            {atividades.map((a) => (
              <li key={a.id}>
                <Cartao>
                  <details open={abertos}>
                    <summary className="cursor-pointer text-lg font-semibold">{a.titulo}</summary>
                    <div className="mt-3">
                      <TextoFormatado texto={versaoDoAluno(a.conteudo_adaptado ?? "")} />
                      <div className="mt-5 max-w-sm">
                        <BarraExportar atividadeId={a.id} titulo={a.titulo} texto={a.conteudo_adaptado ?? ""} />
                      </div>
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
        {!observacoes.length ? (
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
