import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { urlDoLogo } from "@/lib/foto";
import { rotuloBimestre, rotuloCargo } from "@/lib/opcoes-cadastro";
import { codigoVerificacao } from "@/components/area/assinaturas-encaminhamento";
import { formatarData } from "@/components/ui";

// Logo e nome da escola para o topo dos documentos do aluno.
// A funcao do banco so responde para quem ja pode ver o aluno.
export async function cabecalhoDoAluno(supabase: SupabaseClient, alunoId: string) {
  const { data } = await supabase.rpc("cabecalho_do_aluno", { p_aluno: alunoId });
  const linha = (data as { logo: string | null; escola: string | null }[] | null)?.[0];
  return { logoEscola: urlDoLogo(linha?.logo), escola: linha?.escola ?? null };
}

// "1º bimestre de 2026 · 01/02/2026 a 30/04/2026" (ou so as datas)
export function periodoDoRelatorio(r: {
  bimestre?: number | null;
  ano_letivo?: number | null;
  periodo_inicio: string;
  periodo_fim: string;
}) {
  const datas = `${formatarData(r.periodo_inicio)} a ${formatarData(r.periodo_fim)}`;
  const bimestre = rotuloBimestre(r.bimestre, r.ano_letivo);
  return bimestre ? `${bimestre} · ${datas}` : datas;
}

// Assinaturas da escola nos relatorios, em texto para os documentos impressos
// (o RLS so devolve as dos relatorios que a pessoa pode ver)
export async function assinaturasDosRelatorios(supabase: SupabaseClient, ids: string[]) {
  if (!ids.length) return new Map<string, string[]>();
  const { data } = await supabase
    .from("relatorio_assinaturas")
    .select("relatorio_id, nome_assinante, cargo, conteudo_sha256, assinado_em")
    .in("relatorio_id", ids)
    .order("assinado_em");
  const mapa = new Map<string, string[]>();
  for (const a of data ?? []) {
    const cargo = rotuloCargo(a.cargo);
    const texto = `Assinado pela escola: ${a.nome_assinante}${cargo ? ` (${cargo})` : ""} em ${formatarData(a.assinado_em, true)} · código ${codigoVerificacao(a.conteudo_sha256)}`;
    mapa.set(a.relatorio_id, [...(mapa.get(a.relatorio_id) ?? []), texto]);
  }
  return mapa;
}
