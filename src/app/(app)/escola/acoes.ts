"use server";

import { refresh } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";

// Desfaz o vinculo: a escola deixa de ver os alunos deste professor
export async function removerProfessor(escolaId: string, professorId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("escola_professores").delete().eq("escola_id", escolaId).eq("professor_id", professorId);
  refresh();
}
