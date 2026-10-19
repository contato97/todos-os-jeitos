import { dadosDaEscola } from "./dados";
import { PainelEscolaView, type ResumoAluno, type ResumoProfessor } from "./painel-escola";

export default async function PainelEscola() {
  const { supabase, escola, professores } = await dadosDaEscola();

  // Contagens vem de funcoes do banco que devolvem SO numeros (nunca o conteudo).
  // As atividades revisadas a escola le direto (o RLS libera so as revisadas).
  const [{ data: resumo }, { data: resumoAlunos }, { data: alunos }, { data: recentes }, { count: convitesPendentes }] =
    await Promise.all([
      supabase.rpc("resumo_escola_professores"),
      supabase.rpc("resumo_escola_alunos"),
      supabase.from("alunos").select("id, nome"),
      supabase
        .from("atividades")
        .select("id, titulo, aluno_id, professor_id, atualizado_em")
        .order("atualizado_em", { ascending: false })
        .limit(6),
      supabase.from("convites").select("*", { count: "exact", head: true }).eq("tipo", "professor").is("usado_em", null),
    ]);

  return (
    <PainelEscolaView
      escola={escola}
      professores={professores}
      resumo={(resumo ?? []) as ResumoProfessor[]}
      resumoAlunos={(resumoAlunos ?? []) as ResumoAluno[]}
      recentes={recentes ?? []}
      nomesAlunos={Object.fromEntries((alunos ?? []).map((a) => [a.id, a.nome]))}
      convitesPendentes={convitesPendentes ?? 0}
    />
  );
}
