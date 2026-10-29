import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/avatar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { ETAPAS, ROTULO_ATUACAO } from "@/lib/opcoes-cadastro";
import type { ResumoAluno, ResumoProfessor } from "../../painel-escola";
import { dadosDaEscola } from "../../dados";

// Ficha do professor para a escola: so leitura, so o que ja foi revisado
export default function FichaProfessor({ params }: PageProps<"/escola/professores/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, professores } = await dadosDaEscola();
  const professor = professores.find((p) => p.id === id);
  if (!professor) notFound(); // nao vinculado a esta escola

  const [{ data: resumo }, { data: resumoAlunos }, { data: alunos }, { data: atividades }, { data: relatorios }] = await Promise.all([
    supabase.rpc("resumo_escola_professores"),
    supabase.rpc("resumo_escola_alunos"),
    supabase.from("alunos").select("id, nome, ano_escolar").eq("professor_id", id).order("nome"),
    supabase
      .from("atividades")
      .select("id, titulo, aluno_id, atualizado_em")
      .eq("professor_id", id)
      .order("atualizado_em", { ascending: false })
      .limit(20),
    supabase
      .from("relatorios")
      .select("id, aluno_id, periodo_inicio, periodo_fim")
      .eq("professor_id", id)
      .order("periodo_fim", { ascending: false })
      .limit(20),
  ]);
  const r = ((resumo ?? []) as ResumoProfessor[]).find((x) => x.professor_id === id);
  const porAluno = new Map(((resumoAlunos ?? []) as ResumoAluno[]).map((a) => [a.aluno_id, a]));
  const nomeAluno = new Map((alunos ?? []).map((a) => [a.id, a.nome]));
  const etapas = professor.etapas.map((e) => ETAPAS.find((x) => x.valor === e)?.rotulo ?? e).join(" · ");

  const numeros = [
    { rotulo: "Alunos", valor: r?.alunos ?? 0 },
    { rotulo: "Observações (30 dias)", valor: r?.observacoes_30d ?? 0 },
    { rotulo: "Atividades revisadas", valor: r?.atividades_revisadas ?? 0 },
    { rotulo: "Relatórios revisados", valor: r?.relatorios_revisados ?? 0 },
    { rotulo: "Famílias conectadas", valor: r?.familias_conectadas ?? 0 },
  ];

  return (
    <>
      <Link href="/escola/professores" className="underline underline-offset-4">
        ← Professores
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Avatar url={null} nome={professor.nome} tamanho={64} />
        <div>
          <h1 className="text-3xl font-semibold">{professor.nome}</h1>
          <p className="mt-1">
            {etapas}
            {professor.atuacao && ` · ${ROTULO_ATUACAO[professor.atuacao] ?? ""}`} · na escola desde{" "}
            {formatarData(professor.desde)}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {numeros.map((n) => (
          <div key={n.rotulo} className="rounded-2xl bg-white/80 p-4 ring-1 ring-marca/10">
            <dt>{n.rotulo}</dt>
            <dd className="mt-1 text-2xl font-semibold">{n.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Cartao>
          <h2 className="text-xl font-semibold">Alunos</h2>
          {!alunos?.length ? (
            <p className="mt-2">Nenhum aluno cadastrado ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-marca/10">
              {alunos.map((a) => {
                const info = porAluno.get(a.id);
                return (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link href={`/escola/alunos/${a.id}`} className="font-medium underline-offset-4 hover:underline">
                      {a.nome}
                    </Link>
                    <span className="flex flex-wrap gap-2">
                      <Etiqueta>{info?.atividades_revisadas ?? 0} atividade(s)</Etiqueta>
                      {info?.familia_conectada ? <Etiqueta tipo="revisado">Família conectada</Etiqueta> : <Etiqueta>Sem família</Etiqueta>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Cartao>

        <div className="space-y-6">
          <Cartao>
            <h2 className="text-xl font-semibold">Atividades revisadas</h2>
            {!atividades?.length ? (
              <div className="mt-3">
                <Vazio>Nenhuma atividade revisada ainda.</Vazio>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {atividades.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong>{a.titulo}</strong> · {nomeAluno.get(a.aluno_id)} · <span className="text-base">{formatarData(a.atualizado_em)}</span>
                    </span>
                    <span className="flex gap-3 text-base">
                      <a href={`/exportar/atividade/${a.id}?formato=pdf`} className="underline underline-offset-4">PDF</a>
                      <a href={`/exportar/atividade/${a.id}?formato=word`} className="underline underline-offset-4">Word</a>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
          <Cartao>
            <h2 className="text-xl font-semibold">Relatórios revisados</h2>
            {!relatorios?.length ? (
              <p className="mt-2">Nenhum relatório revisado ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relatorios.map((rel) => (
                  <li key={rel.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {nomeAluno.get(rel.aluno_id)} · {formatarData(rel.periodo_inicio)} a {formatarData(rel.periodo_fim)}
                    </span>
                    <span className="flex gap-3 text-base">
                      <Link href={`/imprimir/relatorio/${rel.id}?versao=familia`} target="_blank" className="underline underline-offset-4">Família</Link>
                      <Link href={`/imprimir/relatorio/${rel.id}?versao=tecnica`} target="_blank" className="underline underline-offset-4">Técnico</Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </div>
      </div>
    </>
  );
}
