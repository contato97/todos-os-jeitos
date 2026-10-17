import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Aviso } from "@/components/formulario";
import { BOTAO_SECUNDARIO, Cartao, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarAluno } from "../../acoes";
import { FormularioAluno } from "../formulario-aluno";

const SECOES = [
  { campo: "interesses", titulo: "Interesses" },
  { campo: "pontos_fortes", titulo: "Pontos fortes" },
  { campo: "o_que_funciona", titulo: "O que funciona" },
  { campo: "o_que_trava", titulo: "O que trava" },
  { campo: "comunicacao", titulo: "Como prefere receber instruções" },
  { campo: "sensorial", titulo: "Sensibilidades sensoriais" },
] as const;

export default function PerfilVivo({ params, searchParams }: PageProps<"/professor/alunos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { novo, editar } = await searchParams;
  const supabase = await criarClienteServidor();
  const [{ data: aluno }, { data: saude }, { count: obsCount }, { count: ativCount }] = await Promise.all([
    supabase.from("alunos").select("*").eq("id", id).maybeSingle(),
    supabase.from("alunos_saude").select("informacoes").eq("aluno_id", id).maybeSingle(),
    supabase.from("observacoes").select("*", { count: "exact", head: true }).eq("aluno_id", id),
    supabase.from("atividades").select("*", { count: "exact", head: true }).eq("aluno_id", id),
  ]);
  if (!aluno) return null;

  if (editar) {
    return (
      <>
        <Link href={`/professor/alunos/${id}`} className="underline underline-offset-4">
          ← Voltar ao perfil
        </Link>
        <Cartao className="mt-4 max-w-3xl">
          <FormularioAluno modo="editar" aluno={{ ...aluno, saude: saude?.informacoes ?? "" }} />
        </Cartao>
      </>
    );
  }

  const preenchidas = SECOES.filter((s) => aluno[s.campo]);

  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.perfil} />
      {novo && (
        <div className="mb-6">
          <Aviso tipo="sucesso">
            Aluno cadastrado! Próximos passos: registre uma observação, adapte uma atividade ou convide a família.
          </Aviso>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {preenchidas.length < SECOES.length && (
            <p className="rounded-2xl bg-mostarda/15 p-4">
              O perfil tem {preenchidas.length} de {SECOES.length} partes preenchidas. Quanto mais completo, melhores as
              adaptações da IA.
            </p>
          )}
          {SECOES.map((s) => (
            <Cartao key={s.campo}>
              <h2 className="text-lg font-semibold">{s.titulo}</h2>
              <p className="mt-1 whitespace-pre-line">{aluno[s.campo] || <em>Ainda não preenchido.</em>}</p>
            </Cartao>
          ))}
        </div>

        <div className="space-y-4">
          <Cartao>
            <h2 className="text-lg font-semibold">Resumo</h2>
            <dl className="mt-2 space-y-1">
              {aluno.ano_escolar && (
                <div>
                  <dt className="inline font-medium">Turma: </dt>
                  <dd className="inline">{aluno.ano_escolar}</dd>
                </div>
              )}
              {aluno.data_nascimento && (
                <div>
                  <dt className="inline font-medium">Nascimento: </dt>
                  <dd className="inline">{formatarData(aluno.data_nascimento)}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium">Observações: </dt>
                <dd className="inline">{obsCount ?? 0}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Atividades: </dt>
                <dd className="inline">{ativCount ?? 0}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Perfil atualizado em: </dt>
                <dd className="inline">{formatarData(aluno.atualizado_em)}</dd>
              </div>
            </dl>
            <Link href={`/professor/alunos/${id}?editar=1`} className={`${BOTAO_SECUNDARIO} mt-4 w-full`}>
              Editar perfil
            </Link>
          </Cartao>

          <Cartao>
            <h2 className="text-lg font-semibold">Saúde</h2>
            <p className="mt-1 text-base">Só você vê. Nunca vai para a IA.</p>
            <p className="mt-2 whitespace-pre-line">{saude?.informacoes || <em>Nada registrado.</em>}</p>
          </Cartao>

          <details className="rounded-2xl p-2">
            <summary className="cursor-pointer text-base underline underline-offset-4">Apagar aluno</summary>
            <form action={apagarAluno.bind(null, id)} className="mt-3 space-y-2">
              <p className="text-base">
                Apaga o perfil, as observações, as atividades e os relatórios deste aluno. Não dá para desfazer.
              </p>
              <button type="submit" className="rounded-full px-4 py-2 font-medium ring-2 ring-coral">
                Apagar definitivamente
              </button>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
