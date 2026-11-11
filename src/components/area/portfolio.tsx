import Link from "next/link";
import { BOTAO, Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { hoje } from "@/lib/datas";
import { rotuloBimestre } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { BotaoGerarPortfolio, EditorPortfolio } from "./portfolio-formularios";

const ROTULO_COMO_FOI: Record<string, string> = { facil: "😀 fácil", medio: "🙂 médio", dificil: "😕 difícil" };

// Portfolio anual do aluno. O professor gera e revisa os relatorios de inicio
// e fim do ano; escola, familia e especialistas leem (o RLS so entrega o que
// cada um pode ver, e os relatorios so depois de revisados).
export async function Portfolio({
  alunoId,
  ano,
  base,
  professor = false,
  familia = false,
}: {
  alunoId: string;
  ano: number;
  base: string; // endereco da pagina, para trocar o ano (?ano=)
  professor?: boolean;
  // A familia le os relatorios pela funcao que so entrega os compartilhados
  familia?: boolean;
}) {
  const supabase = await criarClienteServidor();
  const inicioAno = `${ano}-01-01`;
  const fimAno = `${ano}-12-31`;
  const [
    { data: relatoriosPortfolio },
    { data: anosComPortfolio },
    { data: daTabela },
    { count: atividades },
    { data: feitas },
    { data: daFamilia },
  ] = await Promise.all([
    supabase
      .from("portfolio_relatorios")
      .select("id, tipo, conteudo, status, atualizado_em")
      .eq("aluno_id", alunoId)
      .eq("ano_letivo", ano),
    supabase.from("portfolio_relatorios").select("ano_letivo").eq("aluno_id", alunoId),
    supabase
      .from("relatorios")
      .select("id, periodo_inicio, periodo_fim, bimestre, ano_letivo")
      .eq("aluno_id", alunoId)
      .eq("status", "revisado")
      .gte("periodo_fim", inicioAno)
      .lte("periodo_inicio", fimAno)
      .order("periodo_inicio"),
    supabase
      .from("atividades")
      .select("*", { count: "exact", head: true })
      .eq("aluno_id", alunoId)
      .eq("status", "revisado")
      .gte("created_at", inicioAno)
      .lte("created_at", `${fimAno}T23:59:59`),
    supabase
      .from("reforco_realizacoes")
      .select("como_foi")
      .eq("aluno_id", alunoId)
      .gte("feita_em", inicioAno)
      .lte("feita_em", `${fimAno}T23:59:59`),
    familia ? supabase.rpc("relatorios_para_familia", { p_aluno: alunoId }) : Promise.resolve({ data: null }),
  ]);
  type RelatorioDoAno = {
    id: string;
    periodo_inicio: string;
    periodo_fim: string;
    bimestre: number | null;
    ano_letivo: number | null;
  };
  const relatorios: RelatorioDoAno[] = familia
    ? ((daFamilia ?? []) as RelatorioDoAno[])
        .filter((r) => r.periodo_fim >= inicioAno && r.periodo_inicio <= fimAno)
        .sort((a, b) => a.periodo_inicio.localeCompare(b.periodo_inicio))
    : ((daTabela ?? []) as RelatorioDoAno[]);

  const inicial = relatoriosPortfolio?.find((r) => r.tipo === "inicial");
  const final = relatoriosPortfolio?.find((r) => r.tipo === "final");
  const anoAtual = Number(hoje().slice(0, 4));
  const anos = [
    ...new Set([anoAtual, anoAtual - 1, ...(anosComPortfolio ?? []).map((a) => a.ano_letivo as number)]),
  ].sort((a, b) => b - a);
  const contagem = (feitas ?? []).reduce<Record<string, number>>((t, f) => {
    if (f.como_foi) t[f.como_foi] = (t[f.como_foi] ?? 0) + 1;
    return t;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ano letivo" className="flex flex-wrap gap-2">
          {anos.map((a) => (
            <Link
              key={a}
              href={`${base}?ano=${a}`}
              aria-current={a === ano ? "page" : undefined}
              className={`rounded-full px-4 py-2 font-medium ${a === ano ? "bg-marca text-creme" : "ring-2 ring-marca/30 hover:bg-marca/5"}`}
            >
              {a}
            </Link>
          ))}
        </nav>
        <Link href={`/imprimir/portfolio/${alunoId}?ano=${ano}`} target="_blank" className={BOTAO}>
          Imprimir portfólio {ano}
        </Link>
      </div>

      <SecaoRelatorio
        titulo="Início do ano: ponto de partida"
        explicacao="Junta o que a escola, o professor, a família e os especialistas registraram, para todos começarem o ano olhando para a mesma criança."
        relatorio={inicial}
        professor={professor}
        alunoId={alunoId}
        ano={ano}
        tipo="inicial"
      />

      <Cartao>
        <h2 className="text-xl font-semibold">Trajetória do ano</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          <li className="rounded-2xl bg-petroleo/10 p-4">
            <p className="text-3xl font-semibold">{relatorios?.length ?? 0}</p>
            <p>relatórios revisados</p>
          </li>
          <li className="rounded-2xl bg-petroleo/10 p-4">
            <p className="text-3xl font-semibold">{atividades ?? 0}</p>
            <p>atividades adaptadas</p>
          </li>
          <li className="rounded-2xl bg-petroleo/10 p-4">
            <p className="text-3xl font-semibold">{feitas?.length ?? 0}</p>
            <p>reforços feitos em casa</p>
            {Object.keys(contagem).length > 0 && (
              <p className="mt-1 text-base">
                {Object.entries(contagem)
                  .map(([k, n]) => `${n} ${ROTULO_COMO_FOI[k] ?? k}`)
                  .join(" · ")}
              </p>
            )}
          </li>
        </ul>
        {!!relatorios?.length && (
          <ol className="mt-5 space-y-2 border-l-4 border-petroleo/40 pl-5">
            {relatorios.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/imprimir/relatorio/${r.id}?versao=familia&aluno=${alunoId}`}
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {rotuloBimestre(r.bimestre, r.ano_letivo) ?? "Relatório"} · {formatarData(r.periodo_inicio)} a{" "}
                  {formatarData(r.periodo_fim)}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Cartao>

      <SecaoRelatorio
        titulo="Fim do ano: trajetória e próximos passos"
        explicacao="Conta a evolução do ano comparando com o ponto de partida: conquistas, o que continuar, o que ajustar e sugestões para o próximo ano."
        relatorio={final}
        professor={professor}
        alunoId={alunoId}
        ano={ano}
        tipo="final"
      />
    </div>
  );
}

function SecaoRelatorio({
  titulo,
  explicacao,
  relatorio,
  professor,
  alunoId,
  ano,
  tipo,
}: {
  titulo: string;
  explicacao: string;
  relatorio?: { id: string; conteudo: string | null; status: string; atualizado_em: string };
  professor: boolean;
  alunoId: string;
  ano: number;
  tipo: "inicial" | "final";
}) {
  return (
    <Cartao>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">{titulo}</h2>
        {relatorio &&
          (relatorio.status === "revisado" ? (
            <Etiqueta tipo="revisado">Revisado em {formatarData(relatorio.atualizado_em)}</Etiqueta>
          ) : (
            <Etiqueta tipo="rascunho">Rascunho</Etiqueta>
          ))}
      </div>
      <p className="mb-4 mt-1 text-base">{explicacao}</p>
      {professor ? (
        <div className="space-y-5">
          {relatorio ? <EditorPortfolio portfolio={relatorio} /> : <Vazio>Ainda não foi gerado.</Vazio>}
          <BotaoGerarPortfolio alunoId={alunoId} ano={ano} tipo={tipo} existe={!!relatorio} />
        </div>
      ) : relatorio ? (
        <TextoFormatado texto={relatorio.conteudo ?? ""} />
      ) : (
        <Vazio>Ainda não disponível. Aparece aqui depois que o professor revisar.</Vazio>
      )}
    </Cartao>
  );
}
