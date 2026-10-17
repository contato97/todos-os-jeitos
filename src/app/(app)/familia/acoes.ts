"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { buscarUsuario } from "@/lib/auth";
import { enviarEmail } from "@/lib/email/enviar";
import { boasVindasFamilia } from "@/lib/email/modelos";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { ErroIA, perguntarIA } from "@/lib/ia/cliente";
import { SISTEMA_REFORCO, descreverPerfil } from "@/lib/ia/prompts";
import { hoje } from "@/lib/datas";
import { enderecoDoSite } from "@/lib/site";
import { criarClienteServidor } from "@/lib/supabase/server";

const LIMITE_DIARIO = 10;
const ARQUIVO_MAXIMO = 10 * 1024 * 1024;
const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"] as const;

export async function darConsentimento(alunoId: string, _: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  if (formData.get("aceito") !== "on") return { erro: "Para continuar, marque que leu e concorda." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("registrar_consentimento", { p_aluno: alunoId });
  if (error) return { erro: "Não foi possível registrar o consentimento." };

  // Primeiro acesso liberado: e-mail de boas-vindas (uma unica vez por pessoa)
  const [{ data: enviar }, usuario, { data: aluno }] = await Promise.all([
    supabase.rpc("marcar_boas_vindas"),
    buscarUsuario(),
    supabase.from("alunos").select("nome").eq("id", alunoId).maybeSingle(),
  ]);
  const { data: claims } = await supabase.auth.getClaims();
  const email = claims?.claims?.email as string | undefined;
  if (enviar && usuario && aluno && email) {
    const site = await enderecoDoSite();
    await enviarEmail(email, boasVindasFamilia({ nome: usuario.nome, aluno: aluno.nome.split(" ")[0], alunoId, site }));
  }
  redirect(`/familia/filhos/${alunoId}`);
}

export async function registrarObservacaoCasa(
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const texto = lerCampo(formData, "texto");
  const data = lerCampo(formData, "data_observacao");
  if (!texto) return { erro: "Escreva o que aconteceu." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("observacoes").insert({
    aluno_id: alunoId,
    origem: "casa",
    texto,
    ...(data ? { data_observacao: data } : {}),
  });
  if (error) return { erro: "Não foi possível enviar.", valores: { texto } };
  refresh();
  return { sucesso: "Enviado! O professor vai ver no perfil." };
}

export async function apagarObservacaoCasa(observacaoId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("observacoes").delete().eq("id", observacaoId);
  refresh();
}

export async function pedirApoio(alunoId: string, _: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const tipo = lerCampo(formData, "tipo") === "licao" ? "licao" : "reforco";
  const pedido = lerCampo(formData, "pedido");
  const arquivo = formData.get("foto");
  const temArquivo = arquivo instanceof File && arquivo.size > 0;
  const valores = { tipo, pedido };

  if (!pedido) return { erro: "Conte o que você precisa.", valores };
  if (temArquivo) {
    const ok = arquivo.size <= ARQUIVO_MAXIMO && ([...TIPOS_IMAGEM, "application/pdf"] as string[]).includes(arquivo.type);
    if (!ok) return { erro: "Envie uma foto (JPG, PNG) ou PDF de até 10 MB.", valores };
  }

  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  if (!usuario) return { erro: "Sessão expirada. Entre de novo.", valores };

  // Limite diario: cada pedido tem custo, e o plano da familia comeca gratuito
  const { count } = await supabase
    .from("reforcos")
    .select("*", { count: "exact", head: true })
    .eq("familia_id", usuario.id)
    .gte("created_at", `${hoje()}T00:00:00-03:00`);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return { erro: `Você já fez ${LIMITE_DIARIO} pedidos hoje. Amanhã tem mais!`, valores };
  }

  const { data: aluno } = await supabase.from("alunos").select("*").eq("id", alunoId).maybeSingle();
  if (!aluno) return { erro: "Não encontramos o perfil do seu filho.", valores };

  let caminho: string | null = null;
  const anexos: Parameters<typeof perguntarIA>[0]["conteudo"] = [];
  if (temArquivo) {
    const bytes = Buffer.from(await arquivo.arrayBuffer());
    const extensao = arquivo.type === "application/pdf" ? "pdf" : arquivo.type.split("/")[1];
    caminho = `${usuario.id}/${crypto.randomUUID()}.${extensao}`;
    const { error } = await supabase.storage.from("licoes").upload(caminho, bytes, { contentType: arquivo.type });
    if (error) caminho = null;
    const data = bytes.toString("base64");
    anexos.push(
      arquivo.type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
        : { type: "image", source: { type: "base64", media_type: arquivo.type as (typeof TIPOS_IMAGEM)[number], data } },
    );
  }

  let resposta: string;
  try {
    resposta = await perguntarIA({
      sistema: SISTEMA_REFORCO,
      conteudo: [
        ...anexos,
        {
          type: "text",
          text: `Tipo de pedido: ${tipo === "licao" ? "LIÇÃO DE CASA" : "REFORÇO"}\n\nPerfil da criança:\n${descreverPerfil(aluno)}\n\nO que o adulto pediu:\n${pedido}${
            anexos.length ? "\n\n(Foto ou PDF da lição anexado.)" : ""
          }`,
        },
      ],
    });
  } catch (e) {
    return { erro: e instanceof ErroIA ? e.message : "Erro ao falar com a IA.", valores };
  }

  const { error } = await supabase.from("reforcos").insert({ aluno_id: alunoId, tipo, pedido, arquivo: caminho, resposta });
  if (error) return { erro: "Não foi possível salvar a resposta.", valores };
  refresh();
  return { sucesso: "Pronto! A orientação está logo abaixo." };
}
