"use server";

// Conversa familia <-> professor. Cada recado passa pela revisao (IA) ANTES de
// ser gravado. So este servidor conhece a MODERACAO_CHAVE que o banco exige
// para gravar, entao ninguem consegue mandar recado sem passar por aqui.
import { refresh } from "next/cache";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { moderarMensagem } from "@/lib/mensagens/moderar";
import { criarClienteServidor } from "@/lib/supabase/server";

const LIMITE = 2000;

export async function enviarMensagem(alunoId: string, _: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const texto = lerCampo(formData, "texto");
  const valores = { texto };
  if (!texto) return { erro: "Escreva o recado.", valores };
  if (texto.length > LIMITE) return { erro: `O recado pode ter até ${LIMITE} caracteres.`, valores };

  const chave = process.env.MODERACAO_CHAVE;
  if (!chave) {
    console.error("[mensagens] falta a variavel MODERACAO_CHAVE");
    return { erro: "A conversa ainda não está configurada. Avise a equipe da Todos os Jeitos.", valores };
  }

  const supabase = await criarClienteServidor();
  // O RLS so devolve o aluno para o professor dele e para a familia com consentimento
  const { data: aluno } = await supabase.from("alunos").select("nome").eq("id", alunoId).maybeSingle();
  if (!aluno) return { erro: "Conversa não encontrada.", valores };

  const revisao = await moderarMensagem(texto, aluno.nome);
  if (!revisao.liberada) {
    // Nada e gravado: a pessoa ve o motivo e uma sugestao para reescrever
    return { aviso: revisao.motivo, valores, dado: revisao.sugestao ?? undefined };
  }

  const { error } = await supabase.rpc("enviar_mensagem", {
    p_aluno: alunoId,
    p_texto: texto,
    p_chave: chave,
    p_revisada: revisao.revisadaPorIA,
  });
  if (error) {
    console.error("[mensagens] nao foi possivel gravar:", error.message);
    return { erro: "Não foi possível enviar agora. Tente de novo.", valores };
  }
  refresh();
  // "dado" muda a cada envio: o formulario usa como chave para se limpar
  return { sucesso: "Recado enviado.", dado: `ok-${crypto.randomUUID()}` };
}
