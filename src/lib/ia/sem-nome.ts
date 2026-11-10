// Troca o nome da crianca por "[criança]" antes de mandar um texto para a IA
// (a IA nunca recebe o nome). Usado em textos escritos por pessoas, como
// recados e orientacoes de especialistas, que podem citar o nome.
export function semNome(texto: string, nomeAluno: string) {
  const partes = nomeAluno
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!partes.length) return texto;
  // Sem \b: ele nao entende acentos ("Lúcia"). Usamos "nao e letra" antes e depois.
  return texto.replace(new RegExp(`(^|[^\\p{L}])(${partes.join("|")})(?=[^\\p{L}]|$)`, "giu"), "$1[criança]");
}
