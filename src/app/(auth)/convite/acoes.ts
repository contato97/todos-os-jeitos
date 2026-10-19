"use server";

import { redirect } from "next/navigation";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { enderecoDoSite } from "@/lib/site";
import { criarClienteServidor } from "@/lib/supabase/server";
import { SENHA_MINIMA, mensagemDeErro } from "../mensagens";

// Quem ja tem conta e esta logado aceita o convite com um clique
export async function aceitarConvite(token: string): Promise<EstadoFormulario> {
  const supabase = await criarClienteServidor();
  const { data: tipo, error } = await supabase.rpc("aceitar_convite", { p_token: token });
  if (error) {
    if (error.message.includes("convite_de_outro_email")) {
      return { erro: "Este convite foi enviado para outro e-mail. Saia e entre com o e-mail que recebeu o convite." };
    }
    if (error.message.includes("convite_para_outro_perfil")) {
      return { erro: "Este convite é para outro tipo de conta (família ou professor)." };
    }
    return { erro: "Este convite não é mais válido. Peça um novo a quem convidou você." };
  }
  redirect(tipo === "familia" ? "/familia" : "/professor");
}

// Familia sem conta: cria a conta pelo proprio convite.
// O banco so aceita se o e-mail for exatamente o do convite.
export async function cadastrarFamilia(token: string, _: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = lerCampo(formData, "nome");
  const email = lerCampo(formData, "email").toLowerCase();
  const senhaBruta = formData.get("senha");
  const senha = typeof senhaBruta === "string" ? senhaBruta : "";
  const valores = { nome, email };

  if (!nome) return { erro: "Informe seu nome.", valores };
  if (senha.length < SENHA_MINIMA) return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`, valores };

  const supabase = await criarClienteServidor();
  const { data: cadastro, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { tipo: "familia", nome, convite: token },
      emailRedirectTo: `${await enderecoDoSite()}/auth/confirmar?proximo=/familia`,
    },
  });
  if (error) {
    // O gatilho do banco recusa quando o e-mail nao bate com o convite
    if (error.code === "unexpected_failure" || error.message.toLowerCase().includes("database error")) {
      return { erro: "Use o mesmo e-mail que recebeu o convite.", valores };
    }
    return { erro: mensagemDeErro(error.code), valores };
  }
  // Confirmacao por e-mail desligada (fase de testes): entra direto no consentimento
  if (cadastro.session) redirect("/familia");
  return { sucesso: `Quase lá! Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar sua conta.` };
}
