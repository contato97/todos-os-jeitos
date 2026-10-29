"use server";

// Server Actions: funcoes que rodam no servidor quando o formulario e enviado.
// A senha vai direto do servidor para o Supabase e nunca e guardada por nos.
import { redirect } from "next/navigation";
import { AREA_DO_PERFIL } from "@/lib/auth";
import { destinoSeguro, lerWhatsapp } from "@/lib/formulario";
import { ATUACOES, CARGOS, ETAPAS, REDES, valorValido } from "@/lib/opcoes-cadastro";
import { enviarBoasVindas } from "@/lib/email/boas-vindas";
import { enderecoDoSite } from "@/lib/site";
import { criarClienteServidor } from "@/lib/supabase/server";
import {
  EMAIL_VALIDO,
  SENHA_MINIMA,
  lerCampo,
  mensagemDeErro,
  type EstadoFormulario,
} from "./mensagens";

function lerSenha(formData: FormData, nome = "senha") {
  const valor = formData.get(nome);
  return typeof valor === "string" ? valor : "";
}

export async function entrar(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  const senha = lerSenha(formData);
  const proximo = destinoSeguro(lerCampo(formData, "proximo"));
  const valores = { email };

  if (!EMAIL_VALIDO.test(email) || !senha) {
    return { erro: "Preencha e-mail e senha.", valores };
  }

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: mensagemDeErro(error.code), valores };

  if (proximo) redirect(proximo);

  // O mesmo cliente ja esta com a sessao nova, entao o RLS libera o proprio perfil
  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", data.user.id)
    .single();
  redirect(perfil ? AREA_DO_PERFIL[perfil.tipo as keyof typeof AREA_DO_PERFIL] : "/");
}

export async function cadastrar(
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const tipo = lerCampo(formData, "tipo") === "escola" ? "escola" : "professor";
  const nome = lerCampo(formData, "nome");
  const escola = lerCampo(formData, "escola");
  const email = lerCampo(formData, "email").toLowerCase();
  const senha = lerSenha(formData);
  const whatsappDigitado = lerCampo(formData, "whatsapp");
  const whatsapp = lerWhatsapp(formData);
  // So do professor
  const rede = lerCampo(formData, "rede");
  const etapas = formData.getAll("etapas").map(String);
  const atuacao = lerCampo(formData, "atuacao");
  // So da escola
  const cargo = lerCampo(formData, "cargo");
  const proximo = destinoSeguro(lerCampo(formData, "proximo"));

  const valores = { tipo, nome, escola, email, whatsapp: whatsappDigitado, rede, etapas: etapas.join(","), atuacao, cargo };

  // Conferimos tudo aqui no servidor tambem: o "required" do navegador
  // pode ser burlado por quem mexe no codigo da pagina
  if (!escola) return { erro: "Informe o nome da escola.", valores };
  if (!nome) return { erro: "Informe seu nome.", valores };

  let dadosPerfil: Record<string, unknown>;
  if (tipo === "professor") {
    if (!valorValido(REDES, rede)) return { erro: "Informe se a escola é pública ou privada.", valores };
    if (etapas.length === 0 || !etapas.every((e) => valorValido(ETAPAS, e))) {
      return { erro: "Marque pelo menos uma etapa em que você leciona.", valores };
    }
    if (!valorValido(ATUACOES, atuacao)) {
      return { erro: "Informe se você é de base comum ou de uma matéria.", valores };
    }
    dadosPerfil = { tipo, nome, escola, whatsapp, rede, etapas, atuacao };
  } else {
    if (!valorValido(CARGOS, cargo)) return { erro: "Informe o seu cargo na escola.", valores };
    dadosPerfil = { tipo, nome, escola, whatsapp, cargo };
  }

  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores };
  if (!whatsapp) return { erro: "Informe um WhatsApp com DDD, por exemplo (11) 91234-5678.", valores };
  if (senha.length < SENHA_MINIMA) {
    return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`, valores };
  }

  const supabase = await criarClienteServidor();
  const { data: cadastro, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      // Estes dados sao lidos pelo gatilho do banco que cria o perfil
      data: dadosPerfil,
      emailRedirectTo: `${await enderecoDoSite()}/auth/confirmar${proximo ? `?proximo=${encodeURIComponent(proximo)}` : ""}`,
    },
  });
  if (error) return { erro: mensagemDeErro(error.code), valores };

  // Se a confirmacao por e-mail estiver desligada no Supabase (fase de testes),
  // a conta ja vem com sessao: entra direto
  if (cadastro.session) {
    // Sem link de confirmacao, as boas-vindas saem agora
    await enviarBoasVindas(supabase, tipo, nome, email, await enderecoDoSite());
    redirect(proximo ?? AREA_DO_PERFIL[tipo]);
  }

  // Por seguranca, o Supabase responde igual se o e-mail ja existir,
  // assim ninguem descobre quais e-mails tem conta. A mensagem tambem e a mesma.
  return {
    sucesso: `Quase lá! Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar sua conta.`,
  };
}

export async function recuperarSenha(
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores: { email } };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await enderecoDoSite()}/auth/confirmar?proximo=/nova-senha`,
  });
  if (error) return { erro: mensagemDeErro(error.code), valores: { email } };

  return {
    sucesso: `Se existir uma conta com ${email}, você vai receber um link para criar uma nova senha.`,
  };
}

export async function definirNovaSenha(
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const senha = lerSenha(formData);
  const confirmacao = lerSenha(formData, "confirmacao");

  if (senha.length < SENHA_MINIMA) {
    return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` };
  }
  if (senha !== confirmacao) return { erro: "As duas senhas não são iguais." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: mensagemDeErro(error.code) };

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", data.user.id)
    .single();
  redirect(perfil ? AREA_DO_PERFIL[perfil.tipo as keyof typeof AREA_DO_PERFIL] : "/login");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}

// Sai e volta para o login, para entrar com outra conta (ex.: testar a escola)
export async function sairETrocarConta() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
