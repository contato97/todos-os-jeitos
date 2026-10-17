import "server-only";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

// Dados usados em varias telas da escola: a propria escola e os professores vinculados
export async function dadosDaEscola() {
  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const [{ data: escola }, { data: vinculos }] = await Promise.all([
    supabase.from("escolas").select("id, nome").eq("responsavel_id", usuario?.id ?? "").maybeSingle(),
    supabase.from("escola_professores").select("professor_id, created_at, professores(etapas, atuacao, perfis(nome))"),
  ]);

  const professores = (vinculos ?? []).map((v) => {
    const prof = Array.isArray(v.professores) ? v.professores[0] : v.professores;
    const perfil = prof ? (Array.isArray(prof.perfis) ? prof.perfis[0] : prof.perfis) : null;
    return {
      id: v.professor_id as string,
      nome: (perfil?.nome as string | undefined) ?? "Professor(a)",
      etapas: (prof?.etapas as string[] | undefined) ?? [],
      atuacao: prof?.atuacao as string | undefined,
      desde: v.created_at as string,
    };
  });

  return { supabase, escola, professores };
}
