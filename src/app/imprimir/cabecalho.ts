import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { urlDoLogo } from "@/lib/foto";
import { rotuloBimestre } from "@/lib/opcoes-cadastro";
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
