import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { BOTAO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";

// Parte visual do painel da escola. Separada da busca de dados para ser usada
// tambem na vitrine com dados de exemplo (/dev/vitrine), sem duplicar codigo.

export type ResumoProfessor = {
  professor_id: string;
  alunos: number;
  atividades_revisadas: number;
  atividades_30d: number;
  relatorios_revisados: number;
  observacoes_30d: number;
  familias_conectadas: number;
  ultima_atividade: string | null;
};

export type ResumoAluno = { aluno_id: string; familia_conectada: boolean; atividades_revisadas: number };

export type DadosPainelEscola = {
  escola: { nome: string } | null;
  professores: { id: string; nome: string }[];
  resumo: ResumoProfessor[];
  resumoAlunos: ResumoAluno[];
  recentes: { id: string; titulo: string; aluno_id: string; professor_id: string; atualizado_em: string }[];
  nomesAlunos: Record<string, string>;
  convitesPendentes: number;
};

export function PainelEscolaView({ escola, professores, resumo, resumoAlunos, recentes, nomesAlunos, convitesPendentes }: DadosPainelEscola) {
  const soma = (campo: keyof ResumoProfessor) => resumo.reduce((t, r) => t + (Number(r[campo]) || 0), 0);
  const nomeProf = new Map(professores.map((p) => [p.id, p.nome]));
  const totalAlunos = resumoAlunos.length;
  const familias = resumoAlunos.filter((a) => a.familia_conectada).length;
  const semAtividade = resumoAlunos.filter((a) => a.atividades_revisadas === 0).length;
  const profsParados = resumo.filter((r) => r.alunos > 0 && r.atividades_30d === 0);

  const numeros = [
    { rotulo: "Professores vinculados", valor: String(professores.length), detalhe: null, faixa: "bg-petroleo" },
    { rotulo: "Alunos acompanhados", valor: String(totalAlunos), detalhe: null, faixa: "bg-salvia" },
    { rotulo: "Atividades adaptadas", valor: String(soma("atividades_revisadas")), detalhe: `${soma("atividades_30d")} nos últimos 30 dias`, faixa: "bg-lavanda" },
    { rotulo: "Relatórios revisados", valor: String(soma("relatorios_revisados")), detalhe: null, faixa: "bg-mostarda" },
    { rotulo: "Famílias conectadas", valor: `${familias}`, detalhe: totalAlunos ? `de ${totalAlunos} alunos` : null, faixa: "bg-coral" },
  ];

  const atencao = [
    ...profsParados.map((p) => ({
      texto: `${nomeProf.get(p.professor_id) ?? "Professor(a)"} não revisou adaptações nos últimos 30 dias`,
      href: `/escola/professores/${p.professor_id}`,
    })),
    ...(semAtividade ? [{ texto: `${semAtividade} aluno(s) ainda sem nenhuma atividade adaptada`, href: "/escola/alunos?filtro=sem-atividade" }] : []),
    ...(totalAlunos - familias > 0 ? [{ texto: `${totalAlunos - familias} aluno(s) sem família conectada`, href: "/escola/alunos?filtro=sem-familia" }] : []),
    ...(convitesPendentes ? [{ texto: `${convitesPendentes} convite(s) para professores aguardando resposta`, href: "/escola/professores" }] : []),
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{escola?.nome ?? "Visão geral"}</h1>
          <p className="mt-1">Um retrato da inclusão na sua escola.</p>
        </div>
        <Link href="/escola/professores" className={BOTAO}>
          Convidar professor
        </Link>
      </div>
      <ComoUsar secao={AJUDA_ESCOLA.visaoGeral} />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {numeros.map((n) => (
          <li key={n.rotulo} className="overflow-hidden rounded-2xl bg-white/80 ring-1 ring-marca/10">
            <span aria-hidden="true" className={`block h-1.5 ${n.faixa}`} />
            <span className="block p-5">
              <span className="block text-3xl font-semibold">{n.valor}</span>
              <span className="mt-1 block">{n.rotulo}</span>
              {n.detalhe && <span className="block text-base">{n.detalhe}</span>}
            </span>
          </li>
        ))}
      </ul>

      {atencao.length > 0 && (
        <Cartao className="mt-6 border-l-4 border-mostarda">
          <h2 className="text-xl font-semibold">Pede atenção</h2>
          <ul className="mt-3 space-y-2">
            {atencao.map((a) => (
              <li key={a.texto}>
                <Link href={a.href} className="underline underline-offset-4">
                  {a.texto}
                </Link>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <Cartao className="mt-6">
        <h2 className="text-xl font-semibold">Por professor</h2>
        {resumo.length === 0 ? (
          <div className="mt-3">
            <Vazio>
              Nenhum professor vinculado ainda.{" "}
              <Link href="/escola/professores" className="underline underline-offset-4">
                Envie o primeiro convite
              </Link>
              .
            </Vazio>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left">
              <caption className="sr-only">Resumo de acompanhamento por professor</caption>
              <thead>
                <tr className="border-b border-marca/15">
                  <th scope="col" className="py-2 pr-4 font-semibold">Professor(a)</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Alunos</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Observações (30 dias)</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Atividades</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Relatórios</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Famílias</th>
                  <th scope="col" className="py-2 font-semibold">Última adaptação</th>
                </tr>
              </thead>
              <tbody>
                {resumo.map((r) => (
                  <tr key={r.professor_id} className="border-b border-marca/10">
                    <th scope="row" className="py-2 pr-4 font-medium">
                      <Link href={`/escola/professores/${r.professor_id}`} className="underline-offset-4 hover:underline">
                        {nomeProf.get(r.professor_id) ?? "Professor(a)"}
                      </Link>
                    </th>
                    <td className="py-2 pr-4">{r.alunos}</td>
                    <td className="py-2 pr-4">{r.observacoes_30d}</td>
                    <td className="py-2 pr-4">{r.atividades_revisadas}</td>
                    <td className="py-2 pr-4">{r.relatorios_revisados}</td>
                    <td className="py-2 pr-4">
                      {r.familias_conectadas} de {r.alunos}
                    </td>
                    <td className="py-2">
                      {r.ultima_atividade ? formatarData(r.ultima_atividade) : <Etiqueta tipo="rascunho">Nenhuma ainda</Etiqueta>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-base">
          A escola vê números e o que já foi revisado. O conteúdo das observações, os dados de saúde e as famílias ficam só com
          cada professor.
        </p>
      </Cartao>

      <Cartao className="mt-6">
        <h2 className="text-xl font-semibold">Adaptações recentes</h2>
        {recentes.length === 0 ? (
          <p className="mt-2">As atividades revisadas pelos professores aparecem aqui.</p>
        ) : (
          <ul className="mt-3 divide-y divide-marca/10">
            {recentes.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <Link href={`/escola/alunos/${a.aluno_id}`} className="underline-offset-4 hover:underline">
                  <strong>{a.titulo}</strong> · {nomesAlunos[a.aluno_id]}
                </Link>
                <span className="text-base">
                  {nomeProf.get(a.professor_id)} · {formatarData(a.atualizado_em)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </>
  );
}
