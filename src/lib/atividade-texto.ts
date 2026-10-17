// Usado no servidor e no navegador: separa a parte do aluno das
// "Dicas para o professor", para baixar a versao que vai para o aluno.
const TITULO_DICAS = /^#{1,3}\s*dicas para o professor\s*:?\s*$/im;

export function versaoDoAluno(texto: string) {
  const corte = texto.search(TITULO_DICAS);
  return corte === -1 ? texto.trim() : texto.slice(0, corte).trim();
}

export function temDicas(texto: string) {
  return TITULO_DICAS.test(texto);
}

// Nome de arquivo seguro a partir do titulo: "Frações – 3º ano" -> "fracoes-3o-ano"
export function nomeDeArquivo(titulo: string) {
  return (
    titulo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/º/g, "o")
      .replace(/ª/g, "a")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "atividade"
  );
}
