import { marked, type Token, type Tokens } from "marked";

// Converte o texto da atividade (Markdown) numa lista simples de blocos.
// Word e PDF sao montados a partir dessa lista, entao os dois ficam iguais.

export type Trecho = { texto: string; negrito?: boolean; italico?: boolean };
export type Bloco =
  | { tipo: "titulo"; nivel: number; trechos: Trecho[] }
  | { tipo: "paragrafo"; trechos: Trecho[] }
  | { tipo: "lista"; ordenada: boolean; inicio: number; itens: Trecho[][] }
  | { tipo: "separador" };

function trechos(tokens: Token[] | undefined, estilo: { negrito?: boolean; italico?: boolean } = {}): Trecho[] {
  if (!tokens) return [];
  return tokens.flatMap((t): Trecho[] => {
    switch (t.type) {
      case "strong":
        return trechos((t as Tokens.Strong).tokens, { ...estilo, negrito: true });
      case "em":
        return trechos((t as Tokens.Em).tokens, { ...estilo, italico: true });
      case "text":
        return (t as Tokens.Text).tokens
          ? trechos((t as Tokens.Text).tokens, estilo)
          : [{ texto: decodificar((t as Tokens.Text).text), ...estilo }];
      case "codespan":
        return [{ texto: decodificar((t as Tokens.Codespan).text), ...estilo }];
      case "link":
        return trechos((t as Tokens.Link).tokens, estilo);
      case "br":
        return [{ texto: "\n", ...estilo }];
      case "escape":
        return [{ texto: (t as Tokens.Escape).text, ...estilo }];
      default:
        return "text" in t && typeof t.text === "string" ? [{ texto: decodificar(t.text), ...estilo }] : [];
    }
  });
}

// O marked devolve alguns caracteres como entidades HTML (&quot; etc.)
function decodificar(texto: string) {
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function paraBlocos(markdown: string): Bloco[] {
  const blocos: Bloco[] = [];
  for (const t of marked.lexer(markdown)) {
    switch (t.type) {
      case "heading":
        blocos.push({ tipo: "titulo", nivel: (t as Tokens.Heading).depth, trechos: trechos((t as Tokens.Heading).tokens) });
        break;
      case "paragraph":
        blocos.push({ tipo: "paragrafo", trechos: trechos((t as Tokens.Paragraph).tokens) });
        break;
      case "list": {
        const lista = t as Tokens.List;
        blocos.push({
          tipo: "lista",
          ordenada: lista.ordered,
          inicio: typeof lista.start === "number" ? lista.start : 1,
          itens: lista.items.map((item) =>
            // itens com sub-listas: juntamos o texto do item (sub-listas viram texto com "- ")
            item.tokens.flatMap((tk, i) =>
              tk.type === "list"
                ? (tk as Tokens.List).items.map((sub) => ({ texto: `\n   – ${sub.text}` }))
                : [...(i > 0 ? [{ texto: " " }] : []), ...trechos("tokens" in tk ? (tk.tokens as Token[]) : [tk])],
            ),
          ),
        });
        break;
      }
      case "blockquote":
        blocos.push(...paraBlocos((t as Tokens.Blockquote).text));
        break;
      case "hr":
        blocos.push({ tipo: "separador" });
        break;
      case "code":
        blocos.push({ tipo: "paragrafo", trechos: [{ texto: (t as Tokens.Code).text }] });
        break;
      case "table": {
        // Tabelas viram linhas de texto simples
        const tabela = t as Tokens.Table;
        const linhas = [tabela.header, ...tabela.rows].map((linha) => linha.map((c) => c.text).join("  |  "));
        linhas.forEach((l) => blocos.push({ tipo: "paragrafo", trechos: [{ texto: l }] }));
        break;
      }
    }
  }
  return blocos;
}
