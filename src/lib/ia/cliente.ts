import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Cliente da API do Claude. A chave vem SO da variavel de ambiente ANTHROPIC_API_KEY
// (lida automaticamente pelo SDK) e nunca chega ao navegador: este arquivo e "server-only".
const cliente = new Anthropic();
const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export class ErroIA extends Error {}

type Conteudo = Anthropic.Beta.BetaContentBlockParam[];

export async function perguntarIA({
  sistema,
  conteudo,
  formatoJson,
}: {
  sistema: string;
  conteudo: Conteudo;
  // Quando informado, a resposta segue exatamente este formato (JSON Schema)
  formatoJson?: Record<string, unknown>;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ErroIA("A IA ainda não está configurada (falta a ANTHROPIC_API_KEY no .env.local).");
  }

  let resposta;
  try {
    resposta = await cliente.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      // "medium": bom equilibrio entre qualidade e tempo de resposta para textos escolares
      output_config: {
        effort: "medium",
        ...(formatoJson ? { format: { type: "json_schema", schema: formatoJson } } : {}),
      },
      // Se o filtro de seguranca recusar o pedido, a API tenta de novo num modelo
      // alternativo recomendado, sem precisarmos tratar isso no codigo
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: sistema,
      messages: [{ role: "user", content: conteudo }],
    });
  } catch (erro) {
    if (erro instanceof Anthropic.RateLimitError) {
      throw new ErroIA("Muitos pedidos à IA agora. Espere um minuto e tente de novo.");
    }
    if (erro instanceof Anthropic.AuthenticationError) {
      throw new ErroIA("A chave da IA é inválida. Confira a ANTHROPIC_API_KEY.");
    }
    // Conta da Anthropic sem saldo: a API responde 400 com esta explicacao
    if (erro instanceof Anthropic.BadRequestError && /credit balance/i.test(erro.message)) {
      console.error("[ia] conta da Anthropic sem creditos");
      throw new ErroIA("A IA está temporariamente indisponível (conta sem créditos). Avise a equipe da Todos os Jeitos.");
    }
    if (erro instanceof Anthropic.APIError) {
      console.error("[ia] erro da API:", erro.status, erro.message);
      throw new ErroIA("A IA não conseguiu responder agora. Tente de novo em instantes.");
    }
    throw erro;
  }

  if (resposta.stop_reason === "refusal") {
    throw new ErroIA("A IA não pôde atender este pedido. Tente reformular o texto.");
  }

  const texto = resposta.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!texto) throw new ErroIA("A IA respondeu vazio. Tente de novo.");
  return texto;
}
