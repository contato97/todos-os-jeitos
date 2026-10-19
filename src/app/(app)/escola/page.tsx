import { dadosDaEscola } from "./dados";
import { PainelEscolaView } from "./painel-escola";

export default async function PainelEscola() {
  const { supabase, escola, professores } = await dadosDaEscola();

  // Tudo ja filtrado pelo RLS: so alunos dos professores vinculados e itens revisados
  const [{ data: alunos }, { data: atividades }, { data: relatorios }] = await Promise.all([
    supabase.from("alunos").select("id, nome, professor_id"),
    supabase.from("atividades").select("id, titulo, aluno_id, professor_id, atualizado_em").order("atualizado_em", { ascending: false }),
    supabase.from("relatorios").select("id, aluno_id, professor_id, atualizado_em"),
  ]);

  return <PainelEscolaView escola={escola} professores={professores} alunos={alunos} atividades={atividades} relatorios={relatorios} />;
}
