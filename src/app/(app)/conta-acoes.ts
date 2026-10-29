"use server";

// Acoes da pagina "Minha conta" (todos os perfis). Cada uma so altera
// a conta de quem esta logado: o RLS e as permissoes de coluna garantem isso.
import { refresh } from "next/cache";
import sharp from "sharp";
import { AREA_DO_PERFIL, buscarUsuario } from "@/lib/auth";
import { EMAIL_VALIDO, lerCampo, lerWhatsapp, type EstadoFormulario } from "@/lib/formulario";
import { ATUACOES, CARGOS, ETAPAS, PROFISSOES, REDES, valorValido } from "@/lib/opcoes-cadastro";
import { enderecoDoSite } from "@/lib/site";
import { criarClienteServidor } from "@/lib/supabase/server";
import { SENHA_MINIMA, mensagemDeErro } from "../(auth)/mensagens";

// Limite por envio no servidor publicado (Netlify aceita ~4,5 MB)
const FOTO_MAXIMA = 4 * 1024 * 1024;

export async function salvarDados(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await buscarUsuario();
  if (!usuario) return { erro: "Sessão expirada. Entre de novo." };
  const nome = lerCampo(formData, "nome");
  if (!nome) return { erro: "Informe seu nome." };
  const whatsapp = lerWhatsapp(formData);
  if (!whatsapp) return { erro: "Informe um WhatsApp com DDD, por exemplo (11) 91234-5678." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("perfis").update({ nome, whatsapp }).eq("id", usuario.id);
  if (error) return { erro: "Não foi possível salvar." };

  if (usuario.tipo === "professor") {
    const escola = lerCampo(formData, "escola");
    const rede = lerCampo(formData, "rede");
    const etapas = formData.getAll("etapas").map(String);
    const atuacao = lerCampo(formData, "atuacao");
    if (!escola) return { erro: "Informe o nome da escola." };
    if (!valorValido(REDES, rede)) return { erro: "Informe se a escola é pública ou privada." };
    if (!etapas.length || !etapas.every((e) => valorValido(ETAPAS, e))) return { erro: "Marque pelo menos uma etapa." };
    if (!valorValido(ATUACOES, atuacao)) return { erro: "Informe como você atua." };
    const { error: e } = await supabase
      .from("professores")
      .update({ escola_nome: escola, rede, etapas, atuacao })
      .eq("id", usuario.id);
    if (e) return { erro: "Não foi possível salvar os dados de professor." };
  }

  if (usuario.tipo === "escola") {
    const escola = lerCampo(formData, "escola");
    const cargo = lerCampo(formData, "cargo");
    if (!escola) return { erro: "Informe o nome da escola." };
    if (!valorValido(CARGOS, cargo)) return { erro: "Informe o seu cargo." };
    const { error: e } = await supabase
      .from("escolas")
      .update({ nome: escola, cargo_responsavel: cargo })
      .eq("responsavel_id", usuario.id);
    if (e) return { erro: "Não foi possível salvar os dados da escola." };
  }

  if (usuario.tipo === "especialista") {
    const profissao = lerCampo(formData, "profissao");
    const registro = lerCampo(formData, "registro").slice(0, 60) || null;
    const clinica = lerCampo(formData, "clinica").slice(0, 160);
    const local = lerCampo(formData, "local").slice(0, 160);
    const atuacao = lerCampo(formData, "atuacao_especialista").slice(0, 300);
    if (!valorValido(PROFISSOES, profissao)) return { erro: "Escolha a sua especialidade." };
    if (!clinica || !local || !atuacao) return { erro: "Preencha clínica, local e como você atua." };
    const { error: e } = await supabase
      .from("especialistas")
      .update({ profissao, registro, clinica, local, atuacao })
      .eq("id", usuario.id);
    if (e) return { erro: "Não foi possível salvar os dados profissionais." };
  }

  refresh();
  return { sucesso: "Dados salvos." };
}

export async function enviarFoto(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await buscarUsuario();
  if (!usuario) return { erro: "Sessão expirada. Entre de novo." };
  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha uma foto." };
  if (!arquivo.type.startsWith("image/") || arquivo.size > FOTO_MAXIMA) {
    return { erro: "Envie uma imagem (JPG, PNG ou WEBP) de até 4 MB." };
  }

  // Padroniza a foto: gira conforme o celular tirou, recorta quadrada 400x400
  // e converte para WEBP. A conversao tambem APAGA os metadados (como a
  // localizacao GPS que muitas fotos de celular carregam).
  let imagem: Buffer;
  try {
    imagem = await sharp(Buffer.from(await arquivo.arrayBuffer()))
      .rotate()
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { erro: "Não conseguimos ler esta imagem. Tente outra foto." };
  }

  const supabase = await criarClienteServidor();
  // Nome novo a cada envio, para o navegador nao mostrar a foto antiga guardada
  const caminho = `${usuario.id}/perfil-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, imagem, { contentType: "image/webp" });
  if (error) return { erro: "Não foi possível enviar a foto." };

  await supabase.from("perfis").update({ foto: caminho }).eq("id", usuario.id);
  if (usuario.foto) await supabase.storage.from("fotos").remove([usuario.foto]);
  refresh();
  return { sucesso: "Foto atualizada." };
}

export async function removerFoto() {
  const usuario = await buscarUsuario();
  if (!usuario?.foto) return;
  const supabase = await criarClienteServidor();
  await supabase.from("perfis").update({ foto: null }).eq("id", usuario.id);
  await supabase.storage.from("fotos").remove([usuario.foto]);
  refresh();
}

export async function alterarSenha(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const ler = (n: string) => (typeof formData.get(n) === "string" ? (formData.get(n) as string) : "");
  const atual = ler("atual");
  const nova = ler("nova");
  if (nova.length < SENHA_MINIMA) return { erro: `A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` };
  if (nova !== ler("confirmacao")) return { erro: "As duas senhas novas não são iguais." };

  const supabase = await criarClienteServidor();
  const { data: claims } = await supabase.auth.getClaims();
  const email = claims?.claims?.email as string | undefined;
  if (!email) return { erro: "Sessão expirada. Entre de novo." };

  // Confere a senha atual antes de trocar (protege se alguem pegar o computador logado)
  const { error: erroAtual } = await supabase.auth.signInWithPassword({ email, password: atual });
  if (erroAtual) return { erro: "A senha atual está incorreta." };

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) return { erro: mensagemDeErro(error.code) };
  return { sucesso: "Senha alterada." };
}

export async function alterarEmail(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores: { email } };
  const usuario = await buscarUsuario();
  if (!usuario) return { erro: "Sessão expirada. Entre de novo." };

  const supabase = await criarClienteServidor();
  const destino = `${await enderecoDoSite()}/auth/confirmar?proximo=${AREA_DO_PERFIL[usuario.tipo]}/conta`;
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: destino });
  if (error) return { erro: mensagemDeErro(error.code), valores: { email } };
  return {
    sucesso: `Enviamos um link de confirmação para ${email}. A troca só vale depois que você clicar nele (o Supabase pode pedir confirmação também no e-mail atual).`,
  };
}
