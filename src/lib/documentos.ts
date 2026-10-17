import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Documentos do aluno (laudos, relatorios de profissionais de saude).
// Dado sensivel: bucket privado "documentos", so o professor acessa, NUNCA vai para a IA.

export const DOCUMENTOS_MAXIMO = 5;
export const DOCUMENTOS_TOTAL = 10 * 1024 * 1024;
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function guardarDocumentos(
  supabase: SupabaseClient,
  professorId: string,
  alunoId: string,
  arquivos: File[],
  descricao?: string,
): Promise<string | null> {
  if (arquivos.length === 0) return null;
  if (arquivos.length > DOCUMENTOS_MAXIMO) return `Anexe no máximo ${DOCUMENTOS_MAXIMO} documentos por vez.`;
  if (arquivos.reduce((t, a) => t + a.size, 0) > DOCUMENTOS_TOTAL) return "Os documentos passam de 10 MB no total.";

  for (const arquivo of arquivos) {
    const nome = arquivo.name.slice(0, 200) || "documento";
    let bytes: Buffer = Buffer.from(await arquivo.arrayBuffer());
    let tipo = arquivo.type;
    let extensao = nome.split(".").pop()?.toLowerCase() ?? "";

    if (tipo.startsWith("image/")) {
      // Regrava a foto: corrige a orientacao e APAGA metadados (ex.: localizacao GPS)
      try {
        bytes = await sharp(bytes).rotate().jpeg({ quality: 90 }).toBuffer();
      } catch {
        return `Não conseguimos abrir a imagem “${nome}”.`;
      }
      tipo = "image/jpeg";
      extensao = "jpg";
    } else if (tipo === "application/pdf" || extensao === "pdf") {
      tipo = "application/pdf";
      extensao = "pdf";
    } else if (tipo === DOCX || extensao === "docx") {
      tipo = DOCX;
      extensao = "docx";
    } else {
      return `O formato de “${nome}” não é aceito. Envie PDF, foto ou Word (.docx).`;
    }

    const caminho = `${professorId}/${alunoId}/${crypto.randomUUID()}.${extensao}`;
    const { error: erroEnvio } = await supabase.storage.from("documentos").upload(caminho, bytes, { contentType: tipo });
    if (erroEnvio) return `Não foi possível enviar “${nome}”.`;

    const { error } = await supabase.from("alunos_documentos").insert({
      aluno_id: alunoId,
      nome_original: nome,
      descricao: descricao?.slice(0, 300) || null,
      caminho,
      tipo,
      tamanho: bytes.length,
    });
    if (error) {
      await supabase.storage.from("documentos").remove([caminho]);
      return `Não foi possível registrar “${nome}”.`;
    }
  }
  return null;
}

// Usado ao apagar o aluno: o banco apaga as linhas sozinho, mas os arquivos
// precisam ser removidos do Storage explicitamente
export async function apagarArquivosDoAluno(supabase: SupabaseClient, alunoId: string) {
  const { data } = await supabase.from("alunos_documentos").select("caminho").eq("aluno_id", alunoId);
  const caminhos = (data ?? []).map((d) => d.caminho);
  if (caminhos.length) await supabase.storage.from("documentos").remove(caminhos);
}
