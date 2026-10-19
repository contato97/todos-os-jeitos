import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import sharp from "sharp";

// Prepara os arquivos enviados pelo professor para a IA:
// - fotos (JPG, PNG, WEBP, HEIC...) -> reduzidas para no maximo 2000 px em JPEG
//   (a IA le imagens; menor = mais rapido e mais barato)
// - PDF -> vai inteiro, a IA le PDFs (inclusive escaneados)
// - Word (.docx) -> extraimos o texto
// - texto (.txt) -> vai como esta

export const LIMITE_ARQUIVOS = 6;
// Todos os arquivos de um envio juntos. O servidor publicado (Netlify) aceita ~4,5 MB por envio;
// as fotos sao reduzidas no navegador antes de enviar (src/lib/reduzir-imagem.ts).
export const LIMITE_TOTAL = 4 * 1024 * 1024;

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ACEITOS = [
  "image/*",
  "application/pdf",
  DOCX,
  ".docx",
  "text/plain",
  ".txt",
].join(",");

type Bloco = Anthropic.Beta.BetaContentBlockParam;

export type ArquivoPreparado = {
  nome: string;
  blocos: Bloco[];
  // O que guardar no Storage (formato aceito pelo bucket)
  guardar: { bytes: Buffer; tipo: string; extensao: string };
};

export class ErroArquivo extends Error {}

function ehDocx(arquivo: File) {
  return arquivo.type === DOCX || arquivo.name.toLowerCase().endsWith(".docx");
}

export async function prepararArquivo(arquivo: File): Promise<ArquivoPreparado> {
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  const nome = arquivo.name;

  if (arquivo.type === "application/pdf" || nome.toLowerCase().endsWith(".pdf")) {
    return {
      nome,
      blocos: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") }, title: nome }],
      guardar: { bytes, tipo: "application/pdf", extensao: "pdf" },
    };
  }

  if (ehDocx(arquivo)) {
    const { value } = await mammoth.extractRawText({ buffer: bytes });
    if (!value.trim()) throw new ErroArquivo(`Não encontramos texto em “${nome}”.`);
    return {
      nome,
      blocos: [{ type: "text", text: `Conteúdo do arquivo Word “${nome}”:\n${value.trim()}` }],
      guardar: { bytes, tipo: DOCX, extensao: "docx" },
    };
  }

  if (arquivo.type === "text/plain" || nome.toLowerCase().endsWith(".txt")) {
    const texto = bytes.toString("utf8");
    return {
      nome,
      blocos: [{ type: "text", text: `Conteúdo do arquivo “${nome}”:\n${texto}` }],
      guardar: { bytes, tipo: "text/plain", extensao: "txt" },
    };
  }

  if (arquivo.type.startsWith("image/")) {
    let jpeg: Buffer;
    try {
      jpeg = await sharp(bytes)
        .rotate() // respeita a orientacao da foto do celular
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch {
      throw new ErroArquivo(`Não conseguimos abrir a imagem “${nome}”. Tente tirar a foto em JPG ou PNG.`);
    }
    return {
      nome,
      blocos: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpeg.toString("base64") } }],
      guardar: { bytes: jpeg, tipo: "image/jpeg", extensao: "jpg" },
    };
  }

  if (nome.toLowerCase().endsWith(".doc")) {
    throw new ErroArquivo(`“${nome}” está no formato antigo do Word (.doc). Salve como .docx ou PDF e envie de novo.`);
  }
  throw new ErroArquivo(`O formato de “${nome}” não é aceito. Envie foto, PDF, Word (.docx) ou texto (.txt).`);
}
