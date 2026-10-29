import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { RegistrosEspecialistas, buscarRegistrosEspecialistas } from "@/components/area/registros-especialistas";
import { FormularioConvite } from "@/components/area/formulario-convite";
import { Cartao, Vazio, formatarData } from "@/components/ui";
import { criarClienteServidor } from "@/lib/supabase/server";
import { convidarFamilia } from "../../../acoes-convite";

const SECOES = [
  ["interesses", "Interesses"],
  ["pontos_fortes", "Pontos fortes"],
  ["o_que_funciona", "O que funciona"],
  ["o_que_trava", "O que trava"],
  ["comunicacao", "Como prefere receber instruções"],
  ["sensorial", "Sensibilidades sensoriais"],
] as const;

// Ficha do aluno para a escola: so leitura, sem saude e sem observacoes
export default function AlunoEscola({ params }: PageProps<"/escola/alunos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: aluno }, { data: atividades }, { data: relatorios }, orientacoes] = await Promise.all([
    supabase.from("alunos").select("*").eq("id", id).maybeSingle(),
    supabase.from("atividades").select("id, titulo, atualizado_em").eq("aluno_id", id).order("atualizado_em", { ascending: false }),
    supabase.from("relatorios").select("id, periodo_inicio, periodo_fim").eq("aluno_id", id).order("periodo_fim", { ascending: false }),
    // A escola recebe so as orientacoes; informacoes clinicas o RLS nao entrega
    buscarRegistrosEspecialistas(supabase, id),
  ]);
  if (!aluno) notFound();

  return (
    <>
      <Link href="/escola/alunos" className="underline underline-offset-4">
        ← Alunos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{aluno.nome}</h1>
      {aluno.ano_escolar && <p className="mt-1">{aluno.ano_escolar}</p>}
      <p className="mt-2 text-base">Somente leitura. Quem edita é o professor do aluno.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Cartao>
            <h2 className="text-xl font-semibold">Perfil vivo</h2>
            <dl className="mt-3 space-y-3">
              {SECOES.map(([campo, titulo]) => (
                <div key={campo}>
                  <dt className="font-semibold">{titulo}</dt>
                  <dd className="whitespace-pre-line">{aluno[campo] || <em>Não preenchido.</em>}</dd>
                </div>
              ))}
            </dl>
          </Cartao>

          <Cartao>
            <h2 className="text-xl font-semibold">Atividades revisadas</h2>
            {!atividades?.length ? (
              <p className="mt-2">Nenhuma ainda.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {atividades.map((a) => (
                  <li key={a.id} className="flex flex-wrap justify-between gap-2">
                    <span>{a.titulo}</span>
                    <span className="flex gap-3">
                      <a href={`/exportar/atividade/${a.id}?formato=pdf`} className="underline underline-offset-4">
                        PDF
                      </a>
                      <a href={`/exportar/atividade/${a.id}?formato=word`} className="underline underline-offset-4">
                        Word
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          <Cartao>
            <h2 className="text-xl font-semibold">Relatórios revisados</h2>
            {!relatorios?.length ? (
              <p className="mt-2">Nenhum ainda.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {relatorios.map((r) => (
                  <li key={r.id} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {formatarData(r.periodo_inicio)} a {formatarData(r.periodo_fim)}
                    </span>
                    <span className="flex gap-3">
                      <Link href={`/imprimir/relatorio/${r.id}?versao=familia`} target="_blank" className="underline underline-offset-4">
                        Família
                      </Link>
                      <Link href={`/imprimir/relatorio/${r.id}?versao=tecnica`} target="_blank" className="underline underline-offset-4">
                        Técnico
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          {orientacoes.length > 0 && (
            <section aria-labelledby="titulo-esp" className="space-y-3">
              <h2 id="titulo-esp" className="text-xl font-semibold">
                Orientações dos especialistas
              </h2>
              <RegistrosEspecialistas registros={orientacoes} />
            </section>
          )}
        </div>

        <Cartao className="h-fit">
          <h2 className="text-xl font-semibold">Convidar a família</h2>
          <p className="mb-4 mt-1">A família recebe um link e dá o consentimento no primeiro acesso.</p>
          <FormularioConvite acao={convidarFamilia.bind(null, id)} comParentesco rotuloBotao="Criar convite" />
        </Cartao>
      </div>
      {!atividades?.length && !relatorios?.length && (
        <div className="mt-6">
          <Vazio>Este aluno ainda não tem atividades ou relatórios revisados.</Vazio>
        </div>
      )}
    </>
  );
}
