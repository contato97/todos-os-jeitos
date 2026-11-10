// Preco de cada modelo da Anthropic, em dolar por 1 milhao de tokens
// (tabela de 2026-11). A Anthropic cobra em dolar; a conversao para reais
// fica para a hora de mostrar (COTACAO_DOLAR).
type Preco = { entrada: number; saida: number; cacheLeitura: number; cacheEscrita: number };

const PRECOS: Record<string, Preco> = {
  "claude-opus-5-5": { entrada: 4, saida: 20, cacheLeitura: 0.2, cacheEscrita: 5 },
  "claude-opus-5": { entrada: 5, saida: 25, cacheLeitura: 0.5, cacheEscrita: 6.25 },
  "claude-opus-4-8": { entrada: 5, saida: 25, cacheLeitura: 0.5, cacheEscrita: 6.25 },
  "claude-sonnet-5-5": { entrada: 2, saida: 10, cacheLeitura: 0.1, cacheEscrita: 2.5 },
  "claude-sonnet-5": { entrada: 2, saida: 10, cacheLeitura: 0.2, cacheEscrita: 2.5 },
  "claude-haiku-5-5": { entrada: 0.1, saida: 0.5, cacheLeitura: 0.01, cacheEscrita: 0.125 },
};

export type UsoTokens = {
  entrada: number;
  saida: number;
  cacheLeitura: number;
  cacheEscrita: number;
};

// Custo de uma chamada em dolar. Modelo fora da tabela: null (aparece como "sem preco" no resumo)
export function custoEmDolar(modelo: string, uso: UsoTokens): number | null {
  const p = PRECOS[modelo];
  if (!p) return null;
  return (
    (uso.entrada * p.entrada + uso.saida * p.saida + uso.cacheLeitura * p.cacheLeitura + uso.cacheEscrita * p.cacheEscrita) /
    1_000_000
  );
}

// Valor aproximado do dolar, so para exibir em reais
export const COTACAO_DOLAR = Number(process.env.COTACAO_DOLAR) || 5.5;

// ---------- Creditos ----------
// 1 credito = ate 2 paginas. Assim, adaptar uma folha conta 1 e uma prova de
// 6 paginas conta 3 (ela custa cerca de 3 vezes mais de IA).
export const PAGINAS_POR_CREDITO = 2;
// Texto colado ou de Word: cerca de 3.000 caracteres equivalem a 1 pagina
export const CARACTERES_POR_PAGINA = 3000;

export function paginasDeTexto(texto: string) {
  return texto.trim() ? Math.ceil(texto.trim().length / CARACTERES_POR_PAGINA) : 0;
}

export function creditosPorPaginas(paginas: number) {
  return Math.max(1, Math.ceil(paginas / PAGINAS_POR_CREDITO));
}
