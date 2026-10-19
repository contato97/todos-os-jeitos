// Roda no NAVEGADOR: reduz fotos antes de enviar.
// O servidor (Netlify) aceita no maximo ~4,5 MB por envio; fotos de celular
// costumam ter 3 a 8 MB. Reduzindo para no maximo 2000 px em JPEG, ficam com
// menos de 1 MB e continuam legiveis para a IA e para imprimir.

export const LIMITE_ENVIO = 4 * 1024 * 1024; // 4 MB por envio (todos os arquivos juntos)
const LADO_MAXIMO = 2000;

export async function reduzirImagem(arquivo: File): Promise<File> {
  // So fotos; PDF, Word e texto seguem como estao. GIF animado tambem nao mexemos.
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/gif") return arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    // Ja pequena e leve: nao precisa mexer
    if (escala === 1 && arquivo.size < 1024 * 1024) return arquivo;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.fillStyle = "#ffffff"; // PNG com fundo transparente vira branco no JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    if (!blob || blob.size >= arquivo.size) return arquivo;
    const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Formato que o navegador nao consegue abrir (ex.: HEIC no Chrome): envia o original
    return arquivo;
  }
}

export async function reduzirImagens(arquivos: File[]) {
  return Promise.all(arquivos.map(reduzirImagem));
}

// Para <input type="file"> de um arquivo so: troca a foto escolhida pela versao reduzida
export async function reduzirNoCampo(campo: HTMLInputElement) {
  const arquivo = campo.files?.[0];
  if (!arquivo) return null;
  const reduzido = await reduzirImagem(arquivo);
  if (reduzido !== arquivo) {
    const dt = new DataTransfer();
    dt.items.add(reduzido);
    campo.files = dt.files;
  }
  return reduzido;
}

export function tamanhoLegivel(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}
