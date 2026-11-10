import { TextoFormatado } from "@/components/ui";
import { rotuloBimestre } from "@/lib/opcoes-cadastro";
import { periodoDoRelatorio } from "../cabecalho";

export type RelatorioDaLinha = {
  id: string;
  periodo_inicio: string;
  periodo_fim: string;
  bimestre: number | null;
  ano_letivo: number | null;
  texto: string | null;
  assinaturas?: string[]; // linhas "Assinado pela escola: ..."
};

// Do mais antigo para o mais recente: ano letivo, bimestre e data
export function ordenarRelatorios(relatorios: RelatorioDaLinha[]) {
  const ano = (r: RelatorioDaLinha) => r.ano_letivo ?? Number(r.periodo_inicio.slice(0, 4));
  return [...relatorios].sort(
    (a, b) => ano(a) - ano(b) || (a.bimestre ?? 9) - (b.bimestre ?? 9) || a.periodo_inicio.localeCompare(b.periodo_inicio),
  );
}

export function anosLetivos(relatorios: RelatorioDaLinha[]) {
  return [...new Set(relatorios.map((r) => r.ano_letivo ?? Number(r.periodo_inicio.slice(0, 4))))];
}

// Corpo da linha do tempo (usado na pagina real e na previa de desenvolvimento)
export function LinhaDoTempoConteudo({ nome, relatorios }: { nome: string; relatorios: RelatorioDaLinha[] }) {
  if (!relatorios.length) return <p>Ainda não há relatórios revisados para montar a linha do tempo.</p>;
  return (
    <>
      <p className="mb-6">
        Este documento reúne, em ordem, os relatórios de acompanhamento de {nome.split(" ")[0]} na escola: o que foi
        trabalhado em cada matéria, como foi a evolução e o que vem a seguir.
      </p>
      {/* Resumo da linha do tempo: um marco por relatorio */}
      <ol className="mb-10 flex flex-wrap gap-2" aria-label="Períodos">
        {relatorios.map((r) => (
          <li key={r.id} className="rounded-full border border-marca/30 px-3 py-1 text-sm">
            {rotuloBimestre(r.bimestre, r.ano_letivo) ?? periodoDoRelatorio(r)}
          </li>
        ))}
      </ol>
      <ol className="space-y-10 border-l-4 border-petroleo/40 pl-6">
        {relatorios.map((r, i) => (
          // Cada periodo comeca numa pagina nova na impressao (menos o primeiro)
          <li key={r.id} className={i > 0 ? "print:break-before-page" : undefined}>
            <h2 className="relative text-xl font-semibold">
              <span aria-hidden="true" className="absolute top-2 -left-[2.1rem] size-4 rounded-full bg-petroleo" />
              {periodoDoRelatorio(r)}
            </h2>
            <div className="mt-3">
              <TextoFormatado texto={r.texto ?? ""} />
              {r.assinaturas?.map((a) => (
                <p key={a} className="mt-3 text-sm">
                  ✓ {a}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
