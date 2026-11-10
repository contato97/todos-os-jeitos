"use server";

import { refresh } from "next/cache";
import sharp from "sharp";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { TIPOS_DOCUMENTO_ESCOLA, valorValido } from "@/lib/opcoes-cadastro";
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

// ---------- Documentos do aluno (laudos e relatorios) ----------
// Limite por envio no servidor publicado (Netlify aceita ~4,5 MB)
const DOCUMENTO_MAXIMO = 4 * 1024 * 1024;

export async function adicionarDocumentoEscola(
  escolaId: string,
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const tipo = lerCampo(formData, "tipo");
  const titulo = lerCampo(formData, "titulo").slice(0, 160);
  const texto = lerCampo(formData, "texto").slice(0, 10000);
  const compartilharFamilia = formData.get("compartilhar_familia") === "on";
  const compartilharEspecialistas = formData.get("compartilhar_especialistas") === "on";
  const arquivo = formData.get("arquivo");
  const temArquivo = arquivo instanceof File && arquivo.size > 0;
  const valores = { tipo, titulo, texto };

  if (!valorValido(TIPOS_DOCUMENTO_ESCOLA, tipo)) return { erro: "Escolha o tipo de documento.", valores };
  if (!titulo) return { erro: "Dê um título ao documento.", valores };
  if (!texto && !temArquivo) return { erro: "Escreva sobre o documento ou envie uma imagem ou PDF.", valores };

  const supabase = await criarClienteServidor();
  let caminho: string | null = null;
  let tipoArquivo: string | null = null;
  if (temArquivo) {
    if (arquivo.size > DOCUMENTO_MAXIMO) return { erro: "O arquivo passa de 4 MB. Envie uma foto menor ou um PDF mais leve.", valores };
    let bytes = Buffer.from(await arquivo.arrayBuffer());
    let extensao: string;
    if (arquivo.type === "application/pdf" || arquivo.name.toLowerCase().endsWith(".pdf")) {
      tipoArquivo = "application/pdf";
      extensao = "pdf";
    } else if (arquivo.type.startsWith("image/")) {
      // Foto: gira conforme o celular e APAGA os metadados (como a localizacao)
      try {
        bytes = await sharp(bytes).rotate().resize(2000, 2000, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      } catch {
        return { erro: "Não conseguimos abrir esta imagem. Tente JPG, PNG ou PDF.", valores };
      }
      tipoArquivo = "image/jpeg";
      extensao = "jpg";
    } else {
      return { erro: "Envie uma imagem (JPG, PNG) ou um PDF.", valores };
    }
    caminho = `${escolaId}/${alunoId}/${crypto.randomUUID()}.${extensao}`;
    const { error } = await supabase.storage.from("escola-documentos").upload(caminho, bytes, { contentType: tipoArquivo });
    if (error) return { erro: "Não foi possível enviar o arquivo.", valores };
  }

  const { error } = await supabase.from("escola_documentos").insert({
    aluno_id: alunoId,
    escola_id: escolaId,
    tipo,
    titulo,
    texto: texto || null,
    arquivo: caminho,
    arquivo_nome: temArquivo ? arquivo.name.slice(0, 200) : null,
    arquivo_tipo: tipoArquivo,
    compartilhar_familia: compartilharFamilia,
    compartilhar_especialistas: compartilharEspecialistas,
  });
  if (error) {
    if (caminho) await supabase.storage.from("escola-documentos").remove([caminho]);
    return { erro: "Não foi possível salvar o documento.", valores };
  }
  refresh();
  return { sucesso: "Documento salvo.", dado: crypto.randomUUID() };
}

export async function alterarCompartilhamentoDocumento(
  documentoId: string,
  campo: "compartilhar_familia" | "compartilhar_especialistas",
  valor: boolean,
) {
  const supabase = await criarClienteServidor();
  await supabase.from("escola_documentos").update({ [campo]: valor }).eq("id", documentoId);
  refresh();
}

export async function apagarDocumentoEscola(documentoId: string) {
  const supabase = await criarClienteServidor();
  const { data: doc } = await supabase.from("escola_documentos").select("arquivo").eq("id", documentoId).maybeSingle();
  if (!doc) return;
  await supabase.from("escola_documentos").delete().eq("id", documentoId);
  if (doc.arquivo) await supabase.storage.from("escola-documentos").remove([doc.arquivo]);
  refresh();
}

// ---------- Assinatura da escola ----------
// O banco confere que quem assina e a escola do aluno e que o documento foi
// revisado; guarda nome, cargo, data e o codigo do texto. Depois, o texto trava.
export async function assinarComoEscola(
  documento: "relatorio" | "encaminhamento",
  id: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const nome = lerCampo(formData, "nome").slice(0, 160);
  if (formData.get("ciente") !== "on") return { erro: "Para assinar, marque a confirmação.", valores: { nome } };
  if (nome.length < 3) return { erro: "Digite o nome completo de quem assina.", valores: { nome } };

  const supabase = await criarClienteServidor();
  const { error } =
    documento === "relatorio"
      ? await supabase.rpc("assinar_relatorio", { p_relatorio: id, p_nome: nome })
      : await supabase.rpc("assinar_encaminhamento", { p_encaminhamento: id, p_nome: nome });
  if (error) {
    if (error.code === "23505") return { erro: "Você já assinou este documento.", valores: { nome } };
    return { erro: "Não foi possível assinar agora. Tente de novo.", valores: { nome } };
  }
  refresh();
  return { sucesso: "Assinado pela escola." };
}
