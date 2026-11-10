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

// "Fazer na plataforma": transforma o material da crianca em blocos. Cada
// linha com espacos para responder ("______") vira um bloco "linha", com o
// texto entre os espacos; o resto continua como texto (Markdown).
export type BlocoMaterial = { tipo: "texto"; md: string } | { tipo: "linha"; partes: string[] };

const ESPACO_RESPOSTA = /_{3,}/;

export function blocosDoMaterial(material: string): BlocoMaterial[] {
  const blocos: BlocoMaterial[] = [];
  let texto: string[] = [];
  const fecharTexto = () => {
    if (texto.join("").trim()) blocos.push({ tipo: "texto", md: texto.join("\n") });
    texto = [];
  };
  for (const linha of material.split("\n")) {
    if (ESPACO_RESPOSTA.test(linha)) {
      fecharTexto();
      // Tira marcas de Markdown que nao fazem sentido ao lado de um campo
      const limpa = linha.replace(/\*\*/g, "").replace(/^\s*[-*]\s+/, "");
      blocos.push({ tipo: "linha", partes: limpa.split(/_{3,}/) });
    } else {
      texto.push(linha);
    }
  }
  fecharTexto();
  return blocos;
}

export function quantidadeDeRespostas(blocos: BlocoMaterial[]) {
  return blocos.reduce((total, b) => total + (b.tipo === "linha" ? b.partes.length - 1 : 0), 0);
}
