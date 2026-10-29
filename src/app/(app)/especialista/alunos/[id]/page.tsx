import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { RegistrosEspecialistas, buscarRegistrosEspecialistas } from "@/components/area/registros-especialistas";
import { Cartao, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESPECIALISTA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarRegistro } from "../../acoes";
import { FormularioRegistro } from "./formulario-registro";

const SECOES = [
  { campo: "interesses", titulo: "Interesses" },
  { campo: "pontos_fortes", titulo: "Pontos fortes" },
  { campo: "o_que_funciona", titulo: "O que funciona" },
  { campo: "o_que_trava", titulo: "O que trava" },
  { campo: "comunicacao", titulo: "Como prefere receber instruções" },
  { campo: "sensorial", titulo: "Sensibilidades sensoriais" },
] as const;

export default function AlunoDoEspecialista({ params }: PageProps<"/especialista/alunos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  const [{ data: aluno }, { data: vinculo }, { data: relatorios }, registros] = await Promise.all([
    supabase
      .from("alunos")
      .select("nome, ano_escolar, interesses, pontos_fortes, o_que_funciona, o_que_trava, comunicacao, sensorial, professor_id")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("especialista_alunos")
      .select("ver_relatorios, pode_registrar")
      .eq("aluno_id", id)
      .eq("especialista_id", usuario?.id ?? "")
      .maybeSingle(),
    // O RLS so devolve relatorios revisados, e so se a escola liberou
    supabase
      .from("relatorios")
      .select("id, periodo_inicio, periodo_fim, versao_tecnica")
      .eq("aluno_id", id)
      .order("periodo_fim", { ascending: false }),
    buscarRegistrosEspecialistas(supabase, id),
  ]);
  if (!aluno || !vinculo) notFound();
  const { data: professor } = await supabase.from("perfis").select("nome").eq("id", aluno.professor_id).maybeSingle();

  return (
    <>
      <Link href="/especialista" className="underline underline-offset-4">
        ← Meus alunos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{aluno.nome}</h1>
      <p className="mt-1">
        {[aluno.ano_escolar, professor?.nome && `Professor(a): ${professor.nome}`].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="min-w-0 space-y-8 lg:col-span-3">
          <section aria-labelledby="titulo-perfil">
            <h2 id="titulo-perfil" className="mb-3 text-xl font-semibold">
              Perfil de aprendizagem
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECOES.map((s) => (
                <Cartao key={s.campo}>
                  <h3 className="font-semibold">{s.titulo}</h3>
                  <p className="mt-1 whitespace-pre-line">{aluno[s.campo] || <em>Ainda não preenchido.</em>}</p>
                </Cartao>
              ))}
            </div>
          </section>

          <section aria-labelledby="titulo-rel">
            <h2 id="titulo-rel" className="mb-3 text-xl font-semibold">
              Relatórios da escola
            </h2>
            {!vinculo.ver_relatorios ? (
              <Vazio>A escola ainda não liberou os relatórios deste aluno para você.</Vazio>
            ) : !relatorios?.length ? (
              <Vazio>Nenhum relatório revisado pelo professor ainda.</Vazio>
            ) : (
              <ul className="space-y-3">
                {relatorios.map((r) => (
                  <li key={r.id}>
                    <Cartao>
                      <details>
                        <summary className="cursor-pointer text-lg font-semibold">
                          {formatarData(r.periodo_inicio)} a {formatarData(r.periodo_fim)}
                        </summary>
                        <div className="mt-3">
                          <TextoFormatado texto={r.versao_tecnica ?? ""} />
                          <Link
                            href={`/imprimir/relatorio/${r.id}?versao=tecnica`}
                            target="_blank"
                            className="mt-4 inline-block underline underline-offset-4"
                          >
                            Imprimir ou salvar em PDF
                          </Link>
                        </div>
                      </details>
                    </Cartao>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <ComoUsar secao={AJUDA_ESPECIALISTA.registros} />
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">Registrar informação</h2>
            {vinculo.pode_registrar ? (
              <FormularioRegistro alunoId={id} />
            ) : (
              <p>A escola ainda não liberou registros para este aluno. Fale com a coordenação.</p>
            )}
          </Cartao>
          <section aria-labelledby="titulo-registros">
            <h2 id="titulo-registros" className="mb-3 text-xl font-semibold">
              Registros dos especialistas
            </h2>
            {!registros.length ? (
              <Vazio>Nenhum registro ainda.</Vazio>
            ) : (
              <RegistrosEspecialistas registros={registros} apagar={apagarRegistro} meuId={usuario?.id} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
