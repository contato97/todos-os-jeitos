"use server";

import { refresh } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";

// Desfaz o vinculo: a escola deixa de ver os alunos deste professor
export async function removerProfessor(escolaId: string, professorId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("escola_professores").delete().eq("escola_id", escolaId).eq("professor_id", professorId);
  refresh();
}

// ---------- Especialistas ----------
// O banco confere que quem faz e o responsavel da escola e que o aluno e
// de um professor desta escola (RLS de especialista_alunos).

export async function vincularAlunoEspecialista(escolaId: string, especialistaId: string, formData: FormData) {
  const alunoId = String(formData.get("aluno") ?? "");
  if (!alunoId) return;
  const supabase = await criarClienteServidor();
  await supabase.from("especialista_alunos").insert({
    aluno_id: alunoId,
    especialista_id: especialistaId,
    escola_id: escolaId,
    ver_relatorios: formData.get("ver_relatorios") === "on",
    pode_registrar: formData.get("pode_registrar") === "on",
  });
  refresh();
}

export async function alterarPermissaoEspecialista(
  alunoId: string,
  especialistaId: string,
  campo: "ver_relatorios" | "pode_registrar",
  valor: boolean,
) {
  const supabase = await criarClienteServidor();
  await supabase
    .from("especialista_alunos")
    .update({ [campo]: valor })
    .eq("aluno_id", alunoId)
    .eq("especialista_id", especialistaId);
  refresh();
}

export async function desvincularAlunoEspecialista(alunoId: string, especialistaId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("especialista_alunos").delete().eq("aluno_id", alunoId).eq("especialista_id", especialistaId);
  refresh();
}

// Tira o especialista da escola: os acompanhamentos dos alunos caem juntos
export async function removerEspecialista(escolaId: string, especialistaId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("escola_especialistas").delete().eq("escola_id", escolaId).eq("especialista_id", especialistaId);
  refresh();
}
