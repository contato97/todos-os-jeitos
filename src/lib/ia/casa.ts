import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// O que a familia contou de casa e pode ajudar a IA: SO o jeito em casa e a
// rotina de estudo. Medicacoes, acompanhamentos e "outras" (que pode ter
// saude) nunca sao lidos aqui. Ver CAMPOS_CASA (ia: true) em opcoes-cadastro.
export async function casaParaIA(supabase: SupabaseClient, alunoId: string) {
  const { data } = await supabase.from("aluno_casa").select("como_em_casa, rotina_estudo").eq("aluno_id", alunoId);
  return (data ?? []).flatMap((f) =>
    [
      f.como_em_casa && `Como é em casa (relato da família): ${f.como_em_casa}`,
      f.rotina_estudo && `Como faz as tarefas em casa (relato da família): ${f.rotina_estudo}`,
    ].filter((linha): linha is string => Boolean(linha)),
  );
}
