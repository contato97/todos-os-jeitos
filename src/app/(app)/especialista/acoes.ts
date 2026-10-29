"use server";

import { refresh } from "next/cache";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { TIPOS_REGISTRO_ESPECIALISTA, valorValido } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";

// O banco so aceita se a escola liberou "pode registrar" para este aluno
export async function registrarInformacao(alunoId: string, _: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const tipo = lerCampo(formData, "tipo");
  const texto = lerCampo(formData, "texto").slice(0, 5000);
  const valores = { tipo, texto };
  if (!valorValido(TIPOS_REGISTRO_ESPECIALISTA, tipo)) return { erro: "Escolha o tipo de registro.", valores };
  if (!texto) return { erro: "Escreva o registro.", valores };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("especialista_registros").insert({ aluno_id: alunoId, tipo, texto });
  if (error) return { erro: "Não foi possível registrar. Confira se a escola liberou registros para este aluno.", valores };
  refresh();
  // "dado" muda a cada envio: o formulario usa como chave para se limpar
  return { sucesso: "Registrado! Já aparece para quem pode ver.", dado: crypto.randomUUID() };
}

export async function apagarRegistro(registroId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("especialista_registros").delete().eq("id", registroId);
  refresh();
}
