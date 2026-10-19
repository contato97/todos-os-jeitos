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

// Reforco: separa a secao "Material para a crianca" (para imprimir/baixar so ela).
// Leva junto o titulo principal da resposta, se houver.
const TITULO_MATERIAL = /^##\s*material para a crian[çc]a\s*:?\s*$/im;

export function materialDaCrianca(texto: string) {
  const inicio = texto.search(TITULO_MATERIAL);
  if (inicio === -1) return null;
  const depois = texto.slice(inicio).replace(TITULO_MATERIAL, "");
  const fim = depois.search(/^##\s/m);
  const corpo = (fim === -1 ? depois : depois.slice(0, fim)).trim();
  const titulo = texto.match(/^#\s+(.+)$/m)?.[1];
  return titulo ? `# ${titulo}\n\n${corpo}` : corpo;
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
