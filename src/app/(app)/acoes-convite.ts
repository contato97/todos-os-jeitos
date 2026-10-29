"use server";

// Convites: professor ou escola convidam a familia de um aluno; escola convida professores e especialistas.
// O banco (RLS) confere se quem convida tem direito; aqui so montamos o link e o e-mail.
import { refresh } from "next/cache";
import { enviarEmail } from "@/lib/email/enviar";
import { conviteEspecialista, conviteFamilia, conviteProfessor } from "@/lib/email/modelos";
import { EMAIL_VALIDO, lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { enderecoDoSite } from "@/lib/site";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export async function convidarFamilia(
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  const parentesco = lerCampo(formData, "parentesco");
  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores: { email, parentesco } };

  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const { data: aluno } = await supabase.from("alunos").select("nome").eq("id", alunoId).maybeSingle();
  const { data: convite, error } = await supabase
    .from("convites")
    .insert({ tipo: "familia", email, aluno_id: alunoId, parentesco: parentesco || null })
    .select("token")
    .single();
  if (error || !convite || !aluno || !usuario) {
    return { erro: "Não foi possível criar o convite.", valores: { email, parentesco } };
  }

  const site = await enderecoDoSite();
  const link = `${site}/convite/${convite.token}`;
  const enviado = await enviarEmail(
    email,
    conviteFamilia({ quemConvida: usuario.nome, aluno: aluno.nome.split(" ")[0], link, site }),
  );
  refresh();
  return {
    sucesso: enviado
      ? `Convite enviado para ${email}. Você também pode mandar o link abaixo pelo WhatsApp.`
      : `Convite criado. O envio de e-mail ainda não está configurado: copie o link abaixo e mande para a família.`,
    dado: link,
  };
}

export async function convidarProfessor(
  escolaId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores: { email } };

  const supabase = await criarClienteServidor();
  const { data: escola } = await supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle();
  const { data: convite, error } = await supabase
    .from("convites")
    .insert({ tipo: "professor", email, escola_id: escolaId })
    .select("token")
    .single();
  if (error || !convite || !escola) return { erro: "Não foi possível criar o convite.", valores: { email } };

  const site = await enderecoDoSite();
  const link = `${site}/convite/${convite.token}`;
  const enviado = await enviarEmail(email, conviteProfessor({ escola: escola.nome, link, site }));
  refresh();
  return {
    sucesso: enviado
      ? `Convite enviado para ${email}. Você também pode mandar o link abaixo.`
      : `Convite criado. O envio de e-mail ainda não está configurado: copie o link abaixo e mande para o professor.`,
    dado: link,
  };
}

export async function cancelarConvite(conviteId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("convites").delete().eq("id", conviteId);
  refresh();
}

export async function convidarEspecialista(
  escolaId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email").toLowerCase();
  if (!EMAIL_VALIDO.test(email)) return { erro: "Informe um e-mail válido.", valores: { email } };

  const supabase = await criarClienteServidor();
  const { data: escola } = await supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle();
  const { data: convite, error } = await supabase
    .from("convites")
    .insert({ tipo: "especialista", email, escola_id: escolaId })
    .select("token")
    .single();
  if (error || !convite || !escola) return { erro: "Não foi possível criar o convite.", valores: { email } };

  const site = await enderecoDoSite();
  const link = `${site}/convite/${convite.token}`;
  const enviado = await enviarEmail(email, conviteEspecialista({ escola: escola.nome, link, site }));
  refresh();
  return {
    sucesso: enviado
      ? `Convite enviado para ${email}. Você também pode mandar o link abaixo.`
      : `Convite criado. O envio de e-mail ainda não está configurado: copie o link abaixo e mande para o especialista.`,
    dado: link,
  };
}
