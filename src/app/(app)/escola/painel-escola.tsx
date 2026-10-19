import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { BOTAO, Cartao, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { diasAtras } from "@/lib/datas";

// Parte visual do painel da escola. Separada da busca de dados para ser usada
// tambem na vitrine com dados de exemplo (/dev/vitrine), sem duplicar codigo.
export type DadosPainelEscola = {
  escola: { nome: string } | null;
  professores: { id: string; nome: string }[];
  alunos: { id: string; nome: string; professor_id: string }[] | null;
  atividades: { id: string; titulo: string; aluno_id: string; professor_id: string; atualizado_em: string }[] | null;
  relatorios: { id: string; professor_id: string }[] | null;
};

export function PainelEscolaView({ escola, professores, alunos, atividades, relatorios }: DadosPainelEscola) {
  const trintaDias = diasAtras(30);

  const porProfessor = professores.map((p) => ({
    ...p,
    alunos: (alunos ?? []).filter((a) => a.professor_id === p.id).length,
    atividades: (atividades ?? []).filter((a) => a.professor_id === p.id).length,
    relatorios: (relatorios ?? []).filter((r) => r.professor_id === p.id).length,
  }));
  const nomeAluno = new Map((alunos ?? []).map((a) => [a.id, a.nome]));
  const nomeProf = new Map(professores.map((p) => [p.id, p.nome]));
  const recentes = (atividades ?? []).slice(0, 6);
  const ativas30 = (atividades ?? []).filter((a) => a.atualizado_em.slice(0, 10) >= trintaDias).length;

  const numeros = [
    { rotulo: "Professores vinculados", valor: professores.length },
    { rotulo: "Alunos acompanhados", valor: alunos?.length ?? 0 },
    { rotulo: "Atividades adaptadas", valor: atividades?.length ?? 0 },
    { rotulo: "Adaptações nos últimos 30 dias", valor: ativas30 },
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

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numeros.map((n) => (
          <div key={n.rotulo} className="rounded-2xl bg-white/80 p-5 ring-1 ring-marca/10">
            <dt>{n.rotulo}</dt>
            <dd className="mt-1 text-3xl font-semibold">{n.valor}</dd>
          </div>
        ))}
      </dl>

      <Cartao className="mt-6">
        <h2 className="text-xl font-semibold">Professores</h2>
        {porProfessor.length === 0 ? (
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
            <table className="w-full min-w-[32rem] text-left">
              <thead>
                <tr className="border-b border-marca/15">
                  <th scope="col" className="py-2 pr-4 font-semibold">Professor(a)</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Alunos</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Atividades revisadas</th>
                  <th scope="col" className="py-2 font-semibold">Relatórios revisados</th>
                </tr>
              </thead>
              <tbody>
                {porProfessor.map((p) => (
                  <tr key={p.id} className="border-b border-marca/10">
                    <td className="py-2 pr-4">{p.nome}</td>
                    <td className="py-2 pr-4">{p.alunos}</td>
                    <td className="py-2 pr-4">{p.atividades}</td>
                    <td className="py-2">{p.relatorios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <strong>{a.titulo}</strong> · {nomeAluno.get(a.aluno_id)}
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
