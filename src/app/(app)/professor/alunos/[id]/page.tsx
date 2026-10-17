import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Aviso } from "@/components/formulario";
import { BOTAO_SECUNDARIO, Cartao, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarAluno, apagarDocumento } from "../../acoes";
import { FormularioDocumentos } from "./formulario-documentos";
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
  const { novo, editar, aviso } = await searchParams;
  const supabase = await criarClienteServidor();
  const [{ data: aluno }, { data: saude }, { count: obsCount }, { count: ativCount }, { data: documentos }] = await Promise.all([
    supabase.from("alunos").select("*").eq("id", id).maybeSingle(),
    supabase.from("alunos_saude").select("informacoes").eq("aluno_id", id).maybeSingle(),
    supabase.from("observacoes").select("*", { count: "exact", head: true }).eq("aluno_id", id),
    supabase.from("atividades").select("*", { count: "exact", head: true }).eq("aluno_id", id),
    supabase
      .from("alunos_documentos")
      .select("id, nome_original, descricao, caminho, tipo, tamanho, created_at")
      .eq("aluno_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!aluno) return null;

  // Links temporarios (10 min) para abrir os documentos do bucket privado
  const { data: links } = documentos?.length
    ? await supabase.storage.from("documentos").createSignedUrls(documentos.map((d) => d.caminho), 600)
    : { data: [] };
  const linkDe = new Map((links ?? []).map((l) => [l.path, l.signedUrl]));

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
      {aviso === "documento" && (
        <div className="mb-4">
          <Aviso tipo="erro">O aluno foi cadastrado, mas um documento não pôde ser anexado. Tente de novo no cartão “Saúde”.</Aviso>
        </div>
      )}
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
            <p className="mt-1 text-base">Só você vê, inclusive os documentos. Nada daqui vai para a IA.</p>
            <p className="mt-2 whitespace-pre-line">{saude?.informacoes || <em>Nada registrado.</em>}</p>

            <h3 className="mt-5 font-semibold">Documentos</h3>
            {!documentos?.length ? (
              <p className="mt-1 text-base">Nenhum documento anexado.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {documentos.map((d) => (
                  <li key={d.id} className="rounded-xl bg-creme/60 p-3">
                    <p className="break-all font-medium">{d.nome_original}</p>
                    {d.descricao && <p className="text-base">{d.descricao}</p>}
                    <p className="text-sm">
                      {d.tipo === "application/pdf" ? "PDF" : d.tipo.startsWith("image/") ? "Foto" : "Word"} ·{" "}
                      {d.tamanho > 1048576 ? `${(d.tamanho / 1048576).toFixed(1)} MB` : `${Math.ceil(d.tamanho / 1024)} KB`} ·{" "}
                      {formatarData(d.created_at)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {linkDe.get(d.caminho) && (
                        <a href={linkDe.get(d.caminho)!} target="_blank" rel="noopener noreferrer" className="text-base underline underline-offset-4">
                          Abrir
                        </a>
                      )}
                      <form action={apagarDocumento.bind(null, d.id)}>
                        <button type="submit" className="text-base underline underline-offset-4">
                          Apagar
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <details className="mt-4">
              <summary className="cursor-pointer font-medium underline underline-offset-4">Anexar documentos</summary>
              <div className="mt-3">
                <FormularioDocumentos alunoId={id} />
              </div>
            </details>
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
