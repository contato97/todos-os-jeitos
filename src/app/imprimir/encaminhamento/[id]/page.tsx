import { notFound } from "next/navigation";
import { Suspense } from "react";
import { codigoVerificacao } from "@/components/area/assinaturas-encaminhamento";
import { TextoFormatado, formatarData } from "@/components/ui";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cabecalhoDoAluno } from "../../cabecalho";
import { Documento } from "../../documento";

// Encaminhamento pronto para imprimir: a escola guarda na pasta do aluno e a
// familia leva a consulta. Quem pode abrir e decidido pelo RLS.
export default function ImprimirEncaminhamento({ params }: PageProps<"/imprimir/encaminhamento/[id]">) {
  return (
    <Suspense>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: enc } = await supabase
    .from("encaminhamentos")
    .select(
      "conteudo, especialidades, status, created_at, aluno_id, professor_id, alunos(nome, ano_escolar, data_nascimento), encaminhamento_assinaturas(id, nome_assinante, papel, conteudo_sha256, assinado_em)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!enc || enc.status !== "revisado") notFound();

  const aluno = Array.isArray(enc.alunos) ? enc.alunos[0] : enc.alunos;
  const [cabecalho, { data: professor }] = await Promise.all([
    cabecalhoDoAluno(supabase, enc.aluno_id),
    supabase.from("perfis").select("nome").eq("id", enc.professor_id).maybeSingle(),
  ]);
  const assinaturas = enc.encaminhamento_assinaturas ?? [];

  const identificacao = [
    ["Aluno(a)", aluno?.nome],
    ["Data de nascimento", aluno?.data_nascimento ? formatarData(aluno.data_nascimento) : null],
    ["Ano / turma", aluno?.ano_escolar],
    ["Escola", cabecalho.escola],
    ["Professor(a)", professor?.nome],
    ["Data do encaminhamento", formatarData(enc.created_at)],
  ].filter(([, valor]) => valor) as [string, string][];

  return (
    <Documento
      {...cabecalho}
      titulo="Relatório de encaminhamento"
      subtitulo={aluno?.nome}
      rodape="Documento elaborado pela escola a partir de observações pedagógicas. Não contém diagnóstico: a avaliação cabe ao profissional de saúde."
    >
      <dl className="mb-8 grid gap-x-6 gap-y-1 rounded-xl border border-marca/20 p-4 sm:grid-cols-2">
        {identificacao.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className="inline font-semibold">{rotulo}: </dt>
            <dd className="inline">{valor}</dd>
          </div>
        ))}
      </dl>

      <TextoFormatado texto={enc.conteudo ?? ""} />

      {enc.especialidades.length > 0 && (
        <p className="mt-6">
          <strong>Profissionais sugeridos para avaliação:</strong> {enc.especialidades.map(rotuloProfissao).join(", ")}
        </p>
      )}

      <section aria-labelledby="titulo-assinaturas" className="mt-10 break-inside-avoid">
        <h2 id="titulo-assinaturas" className="text-lg font-semibold">
          Assinaturas
        </h2>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="border-t border-marca/60 pt-2">{professor?.nome ?? "Professor(a)"}</p>
            <p className="text-sm">Professor(a) responsável</p>
          </div>
          {assinaturas.length ? (
            assinaturas.map((a) => (
              <div key={a.id}>
                <p className="border-t border-marca/60 pt-2">{a.nome_assinante}</p>
                <p className="text-sm">
                  Responsável pela criança · assinado eletronicamente na plataforma em {formatarData(a.assinado_em, true)}
                </p>
                <p className="text-sm">Código de verificação: {codigoVerificacao(a.conteudo_sha256)}</p>
              </div>
            ))
          ) : (
            <div>
              <p className="mt-6 border-t border-marca/60 pt-2">&nbsp;</p>
              <p className="text-sm">Responsável pela criança (nome e assinatura)</p>
            </div>
          )}
        </div>
      </section>
    </Documento>
  );
}
