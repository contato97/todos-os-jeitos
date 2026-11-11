import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TextoFormatado } from "@/components/ui";
import { buscarUsuario } from "@/lib/auth";
import { hoje } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { assinaturasDosRelatorios, cabecalhoDoAluno, periodoDoRelatorio } from "../../cabecalho";
import { Documento } from "../../documento";
import { ordenarRelatorios, type RelatorioDaLinha } from "../../linha-do-tempo/linha";

// Portfolio do ano pronto para imprimir: inicio do ano, relatorios dos
// bimestres e fim do ano. So entram os relatorios revisados (o RLS e a
// funcao da familia decidem o que cada um ve).
//   /imprimir/portfolio/{aluno}?ano=2026
export default function ImprimirPortfolio({ params, searchParams }: PageProps<"/imprimir/portfolio/[alunoId]">) {
  return (
    <Suspense>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: Promise<{ alunoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { alunoId } = await params;
  const anoLido = Number((await searchParams).ano);
  const ano = anoLido >= 2020 && anoLido <= 2100 ? anoLido : Number(hoje().slice(0, 4));
  const usuario = await buscarUsuario();
  if (!usuario) notFound();
  const familia = usuario.tipo === "familia";
  const supabase = await criarClienteServidor();
  const inicioAno = `${ano}-01-01`;
  const fimAno = `${ano}-12-31`;

  const [{ data: aluno }, cabecalho, { data: partes }] = await Promise.all([
    supabase.from("alunos").select("nome, ano_escolar").eq("id", alunoId).maybeSingle(),
    cabecalhoDoAluno(supabase, alunoId),
    supabase
      .from("portfolio_relatorios")
      .select("tipo, conteudo")
      .eq("aluno_id", alunoId)
      .eq("ano_letivo", ano)
      .eq("status", "revisado"),
  ]);
  if (!aluno) notFound();

  let relatorios: RelatorioDaLinha[];
  if (familia) {
    const { data } = await supabase.rpc("relatorios_para_familia", { p_aluno: alunoId });
    relatorios = ((data ?? []) as (Omit<RelatorioDaLinha, "texto"> & { versao_familia: string | null })[]).map((r) => ({
      ...r,
      texto: r.versao_familia,
    }));
  } else {
    const { data } = await supabase
      .from("relatorios")
      .select("id, periodo_inicio, periodo_fim, bimestre, ano_letivo, versao_familia")
      .eq("aluno_id", alunoId)
      .eq("status", "revisado");
    relatorios = (data ?? []).map((r) => ({ ...r, texto: r.versao_familia }));
  }
  relatorios = relatorios.filter((r) => r.periodo_fim >= inicioAno && r.periodo_inicio <= fimAno);
  const assinaturas = await assinaturasDosRelatorios(
    supabase,
    relatorios.map((r) => r.id),
  );
  relatorios = ordenarRelatorios(relatorios.map((r) => ({ ...r, assinaturas: assinaturas.get(r.id) })));

  const inicial = partes?.find((p) => p.tipo === "inicial")?.conteudo;
  const final = partes?.find((p) => p.tipo === "final")?.conteudo;

  return (
    <Documento
      {...cabecalho}
      titulo={`Portfólio ${ano}`}
      subtitulo={[aluno.nome, aluno.ano_escolar].filter(Boolean).join(" · ")}
      rodape="Portfólio do ano, com relatórios revisados pelo professor."
    >
      {!inicial && !relatorios.length && !final ? (
        <p>Ainda não há relatórios revisados no portfólio deste ano.</p>
      ) : (
        <>
          {inicial && (
            <section className="mb-10">
              <h2 className="mb-3 text-2xl font-semibold">Início do ano: ponto de partida</h2>
              <TextoFormatado texto={inicial} />
            </section>
          )}
          {relatorios.length > 0 && (
            <section className="mb-10 print:break-before-page">
              <h2 className="mb-3 text-2xl font-semibold">Ao longo do ano</h2>
              <ol className="space-y-8 border-l-4 border-petroleo/40 pl-6">
                {relatorios.map((r) => (
                  <li key={r.id}>
                    <h3 className="text-xl font-semibold">{periodoDoRelatorio(r)}</h3>
                    <div className="mt-2">
                      <TextoFormatado texto={r.texto ?? ""} />
                    </div>
                    {r.assinaturas?.map((a) => (
                      <p key={a} className="mt-2 text-sm">
                        ✓ {a}
                      </p>
                    ))}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {final && (
            <section className="print:break-before-page">
              <h2 className="mb-3 text-2xl font-semibold">Fim do ano: trajetória e próximos passos</h2>
              <TextoFormatado texto={final} />
            </section>
          )}
        </>
      )}
    </Documento>
  );
}
