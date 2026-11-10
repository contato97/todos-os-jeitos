import "server-only";
import { ErroIA, perguntarIA } from "@/lib/ia/cliente";
import { SCHEMA_MODERACAO, SISTEMA_MODERACAO } from "@/lib/ia/prompts";
import { semNome } from "@/lib/ia/sem-nome";

export type ResultadoModeracao =
  | { liberada: true; revisadaPorIA: boolean }
  | { liberada: false; motivo: string; sugestao: string | null };

// Filtro simples, usado so quando a IA esta indisponivel (ex.: sem creditos).
// Pega o grosso (xingamentos comuns); a revisao completa e a da IA.
const TERMOS_OFENSIVOS = [
  /\bidiota/i,
  /\bburr[oa]s?\b/i,
  /\bimbecil/i,
  /\bincompetente/i,
  /\bidiot/i,
  /\bretardad/i,
  /\bdesgraçad/i,
  /\bmerda\b/i,
  /\bporra\b/i,
  /\bcaralho/i,
  /\bfdp\b/i,
  /\bvagabund/i,
  /\bot[áa]ri[oa]/i,
  /\bpalhaç/i,
  /\bvai se f/i,
  /\bcala a boca/i,
];

export async function moderarMensagem(texto: string, nomeAluno: string): Promise<ResultadoModeracao> {
  try {
    const json = await perguntarIA({
      sistema: SISTEMA_MODERACAO,
      formatoJson: SCHEMA_MODERACAO,
      esforco: "low",
      // Revisar recado nao gasta credito de ninguem
      registro: { acao: "moderacao", paginas: 0, creditos: 0 },
      conteudo: [{ type: "text", text: `Recado a revisar:\n"""\n${semNome(texto, nomeAluno)}\n"""` }],
    });
    const r = JSON.parse(json) as { adequada: boolean; motivo: string; sugestao: string };
    if (r.adequada) return { liberada: true, revisadaPorIA: true };
    const primeiroNome = nomeAluno.split(" ")[0];
    return {
      liberada: false,
      motivo: r.motivo || "Este recado pode soar ofensivo. Que tal reescrever?",
      sugestao: r.sugestao ? r.sugestao.replaceAll("[criança]", primeiroNome) : null,
    };
  } catch (e) {
    // IA fora do ar: o filtro basico decide, para a conversa nao parar
    if (!(e instanceof ErroIA) && !(e instanceof SyntaxError)) console.error("[mensagens] erro na revisao:", e);
    if (TERMOS_OFENSIVOS.some((t) => t.test(texto))) {
      return {
        liberada: false,
        motivo: "Este recado tem palavras que podem ofender. Reescreva com respeito para ele ser enviado.",
        sugestao: null,
      };
    }
    return { liberada: true, revisadaPorIA: false };
  }
}
